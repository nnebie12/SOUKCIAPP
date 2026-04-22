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
  if (!user) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const payload = await request.json().catch(() => ({}));
  const shopId = String(payload.shopId ?? '');
  if (!shopId) {
    return jsonResponse(400, { error: 'Missing shopId' });
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

  await adminClient
    .from('merchant_subscription_state')
    .upsert({
      user_id: user.id,
      shop_id: shopId,
      entitlement_id: PREMIUM_ENTITLEMENT_ID,
      platform: 'android',
      status: isActive ? 'active' : 'inactive',
      expires_at: entitlement?.expires_date ?? null,
      last_synced_at: new Date().toISOString(),
      raw_customer_info: subscriberData,
    }, { onConflict: 'shop_id,entitlement_id' });

  await adminClient
    .from('shops')
    .update({ is_premium: Boolean(isActive) })
    .eq('id', shopId)
    .eq('owner_id', user.id);

  return jsonResponse(200, { isPremium: Boolean(isActive) });
});
