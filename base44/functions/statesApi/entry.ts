import { preflight, authenticateApiKey, corsHeaders } from '../../shared/apiAuth.js';
import { JURISDICTIONS } from '../../shared/jurisdictions.js';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { error } = await authenticateApiKey(req);
    if (error) return error;

    const states = JURISDICTIONS.map(j => ({
      code: j.code,
      name: j.name,
      iin: j.iin,
      aamvaVersion: j.aamvaVersion,
      jurisdictionVersion: j.jurisdictionVersion,
      revision: j.revision,
    }));

    return Response.json({
      success: true,
      count: states.length,
      states,
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});