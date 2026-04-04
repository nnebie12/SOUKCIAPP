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
    return jsonResponse(405, { success: false, error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = request.headers.get('Authorization');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(500, { success: false, error: 'Supabase environment variables are missing' });
  }

  if (!authHeader) {
    return jsonResponse(401, { success: false, error: 'Missing Authorization header' });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, error: 'Unauthorized' });
  }

  const payload = await request.json().catch(() => ({}));
  const source = typeof payload?.source === 'string' ? payload.source : 'unknown';
  const user = userData.user;

  const { error: auditError } = await adminClient.from('account_deletion_audit').insert({
    user_id: user.id,
    email: user.email ?? null,
    source,
    requested_at: new Date().toISOString(),
    deleted_at: new Date().toISOString(),
  });

  if (auditError) {
    return jsonResponse(500, { success: false, error: 'Failed to write deletion audit' });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id, true);
  if (deleteError) {
    return jsonResponse(500, { success: false, error: 'Failed to delete user' });
  }

  return jsonResponse(200, { success: true });
});