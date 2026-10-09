import { preflight, authenticateApiKey, corsHeaders } from '../../shared/apiAuth.js';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { user, error } = await authenticateApiKey(req);
    if (error) return error;

    return Response.json({
      success: true,
      email: user.email,
      role: user.role,
      credits: user.credits || 0,
      apiKey: user.apiKey,
      referralCode: user.referralCode,
      referralBalance: user.referralBalance || 0,
      referralCount: user.referralCount || 0,
      referralEarned: user.referralEarned || 0,
      createdDate: user.created_date,
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});