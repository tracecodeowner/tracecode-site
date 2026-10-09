import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Supabase order function is missing required configuration');
    return jsonResponse({ error: 'Payment service is not configured' }, 500);
  }
  if (!authorization) {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  try {
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Authentication required' }, 401);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    const reference = `TC-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    const { error: insertError } = await serviceClient
      .from('trakteer_orders')
      .insert({
        user_id: user.id,
        reference,
        package_key: 'starter',
        unit_name: '2 Barcode',
        quantity: 1,
        amount_idr: 100000,
        amount_usd: 5,
        credits: 2,
      });

    if (insertError) throw insertError;
    return jsonResponse({ reference });
  } catch (error) {
    console.error('Failed to create Trakteer order:', error);
    return jsonResponse({ error: 'Could not create payment order. Please try again.' }, 500);
  }
});
