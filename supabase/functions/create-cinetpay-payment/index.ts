import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const cinetPayApiKey = Deno.env.get('CINETPAY_API_KEY');
  const cinetPaySiteId = Deno.env.get('CINETPAY_SITE_ID');
  const cinetPayReturnUrl = Deno.env.get('CINETPAY_RETURN_URL');
  const authHeader = request.headers.get('Authorization');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !cinetPayApiKey || !cinetPaySiteId || !cinetPayReturnUrl) {
    return jsonResponse(500, { error: 'Missing payment environment variables' });
  }

  if (!authHeader) {
    return jsonResponse(401, { error: 'Missing Authorization header' });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonResponse(400, { error: 'Invalid payload' });
  }

  const amount = Number(payload.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0 || amount % 5 !== 0) {
    return jsonResponse(400, { error: 'Amount must be a positive multiple of 5' });
  }

  const transactionId = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const sessionInsert = {
    user_id: userData.user.id,
    provider: 'cinetpay',
    status: 'initiated',
    amount,
    currency: 'XOF',
    transaction_id: transactionId,
    metadata: payload,
  };

  const { data: session, error: sessionError } = await adminClient
    .from('payment_sessions')
    .insert(sessionInsert)
    .select('id')
    .single();

  if (sessionError || !session?.id) {
    return jsonResponse(500, { error: 'Unable to create payment session' });
  }

  const customer = payload.customer ?? {};
  const notifyUrl = `${supabaseUrl}/functions/v1/cinetpay-notify`;
  const cinetPayload = {
    apikey: cinetPayApiKey,
    site_id: cinetPaySiteId,
    transaction_id: transactionId,
    amount,
    currency: 'XOF',
    description: String(payload.description ?? 'Commande SoukCI'),
    notify_url: notifyUrl,
    return_url: cinetPayReturnUrl,
    channels: 'MOBILE_MONEY',
    lang: 'FR',
    metadata: JSON.stringify({ sessionId: session.id, userId: userData.user.id }),
    customer_id: userData.user.id,
    customer_name: String(customer.name ?? 'Client'),
    customer_surname: String(customer.surname ?? 'SoukCI'),
    customer_email: String(customer.email ?? userData.user.email ?? 'support@soukci.app'),
    customer_phone_number: String(customer.phone ?? ''),
    customer_address: String(customer.address ?? 'Abidjan'),
    customer_city: String(customer.city ?? 'Abidjan'),
    customer_country: 'CI',
    customer_state: 'CI',
    customer_zip_code: '00000',
  };

  const cinetResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'SoukCI-Supabase-Edge' },
    body: JSON.stringify(cinetPayload),
  });

  const cinetData = await cinetResponse.json().catch(() => null);
  const paymentUrl = cinetData?.data?.payment_url;

  if (!cinetResponse.ok || !paymentUrl) {
    await adminClient
      .from('payment_sessions')
      .update({ status: 'failed', raw_response: cinetData })
      .eq('id', session.id);

    return jsonResponse(502, { error: cinetData?.description || 'Unable to initialize payment' });
  }

  await adminClient
    .from('payment_sessions')
    .update({ status: 'pending', checkout_url: paymentUrl, raw_response: cinetData })
    .eq('id', session.id);

  return jsonResponse(200, {
    sessionId: session.id,
    checkoutUrl: paymentUrl,
    transactionId,
  });
});
