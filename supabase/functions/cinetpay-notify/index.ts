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

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const cinetPayApiKey = Deno.env.get('CINETPAY_API_KEY');
  const cinetPaySiteId = Deno.env.get('CINETPAY_SITE_ID');

  if (!supabaseUrl || !serviceRoleKey || !cinetPayApiKey || !cinetPaySiteId) {
    return jsonResponse(500, { error: 'Missing environment variables' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const contentType = request.headers.get('Content-Type') ?? '';
  let transactionId = '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    transactionId = String(body.cpm_trans_id ?? body.transaction_id ?? '');
  } else {
    const formData = await request.formData().catch(() => null);
    transactionId = String(formData?.get('cpm_trans_id') ?? '');
  }

  if (!transactionId) {
    return jsonResponse(400, { error: 'Missing transaction id' });
  }

  const verifyResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'SoukCI-Supabase-Edge' },
    body: JSON.stringify({
      apikey: cinetPayApiKey,
      site_id: cinetPaySiteId,
      transaction_id: transactionId,
    }),
  });

  const verifyData = await verifyResponse.json().catch(() => null);
  const { data: session } = await adminClient
    .from('payment_sessions')
    .select('*')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (!session) {
    return jsonResponse(404, { error: 'Unknown transaction' });
  }

  if (session.status === 'paid') {
    return jsonResponse(200, { success: true, alreadyProcessed: true });
  }

  const code = String(verifyData?.code ?? '');
  const paymentStatus = String(verifyData?.data?.status ?? '');

  if (code === '00' && paymentStatus === 'ACCEPTED') {
    const metadata = session.metadata ?? {};
    const shopGroups = Array.isArray(metadata.shopGroups) ? metadata.shopGroups : [];

    for (const group of shopGroups) {
      const { data: order } = await adminClient
        .from('orders')
        .insert({
          user_id: session.user_id,
          shop_id: group.shopId,
          status: 'pending',
          total_amount: group.totalAmount,
          delivery_address: metadata.address || null,
          delivery_fee: group.deliveryFee || 0,
          payment_method: metadata.paymentMethod || null,
          payment_status: 'paid',
          notes: metadata.notes || null,
          payment_session_id: session.id,
          payment_provider: 'cinetpay',
          payment_transaction_id: transactionId,
          paid_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (order?.id && Array.isArray(group.items) && group.items.length > 0) {
        await adminClient.from('order_items').insert(
          group.items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        );
      }
    }

    await adminClient
      .from('cart_items')
      .delete()
      .eq('user_id', session.user_id);

    await adminClient
      .from('payment_sessions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        raw_response: verifyData,
      })
      .eq('id', session.id);

    return jsonResponse(200, { success: true });
  }

  await adminClient
    .from('payment_sessions')
    .update({ status: 'failed', raw_response: verifyData })
    .eq('id', session.id);

  return jsonResponse(200, { success: false, code, paymentStatus });
});
