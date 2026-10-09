import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generatePayload } from '../../shared/aamva.js';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    if (!apiKey) {
      return Response.json({ error: 'Missing API key. Provide X-API-Key header.' }, { status: 401, headers: corsHeaders });
    }

    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ apiKey });
    const user = users?.[0];
    if (!user) {
      return Response.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { formData, jurisdictionCode, profileKey, options } = body;
    if (!formData || !jurisdictionCode || !profileKey) {
      return Response.json({ error: 'Missing required parameters: formData, jurisdictionCode, profileKey' }, { status: 400, headers: corsHeaders });
    }

    const userCredits = user.credits || 0;
    if (userCredits < 1) {
      return Response.json({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS', required: 1, available: userCredits }, { status: 403, headers: corsHeaders });
    }

    const newBalance = userCredits - 1;
    await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });

    await base44.asServiceRole.entities.CreditTransaction.create({
      action: 'usage',
      credits: -1,
      remainingBalance: newBalance,
      description: `API barcode generation: ${jurisdictionCode} / ${profileKey}`,
    });

    const result = generatePayload(formData, jurisdictionCode, profileKey, options || {});

    await base44.asServiceRole.entities.GenerationHistory.create({
      jurisdiction: jurisdictionCode,
      jurisdictionName: result.jurisdiction.name,
      profile: profileKey,
      aamvaVersion: result.header.aamvaVersion,
      jurisdictionVersion: result.header.jurisdictionVersion,
      iin: result.header.iin,
      validationStatus: 'valid',
      payloadLength: result.stats.totalPayloadLength,
      subfileLength: result.stats.dlSubfileLength,
      subfileType: 'DL',
      offset: result.stats.dlOffset,
      numberOfEntries: result.header.numberOfEntries,
      barcodeStatus: 'generated',
      source: 'api',
    });

    return Response.json({
      success: true,
      payload: result.payloadString,
      header: result.header,
      stats: result.stats,
      remainingCredits: newBalance,
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});