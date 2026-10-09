import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-webhook-token',
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

  const webhookToken = Deno.env.get('TRAKTEER_WEBHOOK_TOKEN');
  const suppliedToken = req.headers.get('X-Webhook-Token');
  if (!webhookToken) {
    console.error('Trakteer webhook token is not configured');
    return jsonResponse({ error: 'Webhook is not configured' }, 500);
  }
  if (!suppliedToken || suppliedToken !== webhookToken) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Trakteer webhook is missing Supabase configuration');
    return jsonResponse({ error: 'Webhook is not configured' }, 500);
  }

  try {
    const body = await req.json();
    if (body?.type !== 'tip') {
      return jsonResponse({ success: true, ignored: true, reason: 'unsupported_event' });
    }

    const reference = typeof body.supporter_message === 'string'
      ? body.supporter_message.trim()
      : '';
    const transactionId = typeof body.transaction_id === 'string'
      ? body.transaction_id.trim()
      : '';
    const unit = typeof body.unit === 'string' ? body.unit : '';
    const quantity = body.quantity;
    const price = body.price;

    if (
      !reference ||
      !transactionId ||
      transactionId.length > 200 ||
      !Number.isSafeInteger(quantity) ||
      !Number.isSafeInteger(price)
    ) {
      return jsonResponse({ success: true, ignored: true, reason: 'incomplete_or_test_event' });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await serviceClient.rpc('process_trakteer_payment', {
      p_reference: reference,
      p_transaction_id: transactionId,
      p_unit: unit,
      p_quantity: quantity,
      p_price: price,
    });
    if (error) throw error;

    if (data?.status === 'processed' || data?.status === 'already_processed') {
      return jsonResponse({ success: true, status: data.status });
    }
    return jsonResponse({ success: true, ignored: true, reason: data?.status || 'unmatched_payment' });
  } catch (error) {
    console.error('Trakteer webhook processing failed:', error);
    return jsonResponse({ error: 'Webhook processing failed' }, 500);
  }
});
