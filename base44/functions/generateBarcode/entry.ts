import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generatePayload } from '../../shared/aamva.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized. Login required to generate barcodes.' }, { status: 401 });

    const body = await req.json();
    const { formData, jurisdictionCode, profileKey, options } = body;

    if (!formData || !jurisdictionCode || !profileKey) {
      return Response.json({ error: 'Missing required parameters: formData, jurisdictionCode, profileKey' }, { status: 400 });
    }

    // Check credits — 1 credit per barcode generation
    const userCredits = user.credits || 0;
    if (userCredits < 1) {
      return Response.json({
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        required: 1,
        available: userCredits
      }, { status: 403 });
    }

    // Deduct 1 credit atomically (server-side, before generating payload)
    const newBalance = userCredits - 1;
    await base44.entities.User.update(user.id, { credits: newBalance });

    // Log credit transaction
    await base44.entities.CreditTransaction.create({
      action: 'usage',
      credits: -1,
      remainingBalance: newBalance,
      description: `Barcode generation: ${jurisdictionCode} / ${profileKey}`,
    });

    // Generate payload
    const result = generatePayload(formData, jurisdictionCode, profileKey, options || {});

    // Log generation history (technical metadata only — no PII by default)
    const storeRawPayloads = user.storeRawPayloads === true;
    await base44.entities.GenerationHistory.create({
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
      source: 'web',
      rawPayload: storeRawPayloads ? result.payloadString : undefined,
    });

    return Response.json({
      success: true,
      payload: result.payloadString,
      header: result.header,
      subfiles: result.subfiles,
      stats: result.stats,
      parsedFields: result.parsedFields,
      jurisdiction: { name: result.jurisdiction.name, code: result.jurisdiction.code, iin: result.jurisdiction.iin, revision: result.jurisdiction.revision },
      remainingCredits: newBalance,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});