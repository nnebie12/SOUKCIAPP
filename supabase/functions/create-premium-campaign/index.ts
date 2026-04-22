import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PREMIUM_ENTITLEMENT_ID = 'merchant_premium';

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

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const revenueCatSecretKey = Deno.env.get('REVENUECAT_SECRET_KEY');
  const authHeader = request.headers.get('Authorization');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !revenueCatSecretKey) {
    return jsonResponse(500, { error: 'Missing environment variables' });
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

  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) return jsonResponse(401, { error: 'Unauthorized' });

  const payload = await request.json().catch(() => null);
  if (!payload) return jsonResponse(400, { error: 'Invalid payload' });

  const shopId = String(payload.shopId ?? '');
  const planId = String(payload.planId ?? '');
  const title = String(payload.title ?? '').trim();
  const description = typeof payload.description === 'string' ? payload.description.trim() : null;

  if (!shopId || !planId || !title) {
    return jsonResponse(400, { error: 'Missing campaign fields' });
  }

  const { data: ownedShop } = await adminClient
    .from('shops')
    .select('id')
    .eq('id', shopId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!ownedShop) {
    return jsonResponse(403, { error: 'Shop does not belong to current merchant' });
  }

  const subscriberResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}`, {
    headers: {
      Authorization: `Bearer ${revenueCatSecretKey}`,
      'Content-Type': 'application/json',
    },
  });
  const subscriberData = await subscriberResponse.json().catch(() => null);
  const entitlement = subscriberData?.subscriber?.entitlements?.[PREMIUM_ENTITLEMENT_ID];
  const isActive = entitlement?.expires_date == null || new Date(entitlement.expires_date).getTime() > Date.now();

  if (!isActive) {
    return jsonResponse(403, { error: 'Premium entitlement is not active' });
  }

  const { data: plan } = await adminClient
    .from('campaign_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();

  if (!plan) {
    return jsonResponse(404, { error: 'Campaign plan not found' });
  }

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + Number(plan.duration_days ?? 0));

  const { data: campaign, error } = await adminClient
    .from('campaigns')
    .insert({
      shop_id: shopId,
      plan_id: planId,
      title,
      description,
      status: 'active',
      starts_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
      payment_status: 'paid',
      payment_provider: 'play_billing',
      paid_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    return jsonResponse(500, { error: error.message });
  }

  return jsonResponse(200, { campaign });
});
