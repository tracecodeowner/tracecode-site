import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

export function preflight(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

export async function authenticateApiKey(req) {
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
  if (!apiKey) {
    return { error: Response.json({ error: 'Missing API key. Provide X-API-Key header.' }, { status: 401, headers: corsHeaders }) };
  }
  const base44 = createClientFromRequest(req);
  const users = await base44.asServiceRole.entities.User.filter({ apiKey });
  const user = users?.[0];
  if (!user) {
    return { error: Response.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders }) };
  }
  if (user.status === 'banned' || user.status === 'suspended') {
    return { error: Response.json({ error: `Account ${user.status}. Contact support.` }, { status: 403, headers: corsHeaders }) };
  }
  return { user, base44 };
}