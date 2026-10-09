import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function generateApiKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return 'tc_live_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const referredByCode = body?.referredByCode || null;

    const updates = {};
    let apiKey = user.apiKey;
    let referralCode = user.referralCode;

    if (!apiKey) {
      apiKey = generateApiKey();
      updates.apiKey = apiKey;
    }
    if (!referralCode) {
      referralCode = generateReferralCode();
      updates.referralCode = referralCode;
    }

    if (user.referralBalance === undefined || user.referralBalance === null) updates.referralBalance = 0;
    if (user.referralCount === undefined || user.referralCount === null) updates.referralCount = 0;
    if (user.referralPayments === undefined || user.referralPayments === null) updates.referralPayments = 0;
    if (user.referralEarned === undefined || user.referralEarned === null) updates.referralEarned = 0;
    if (user.referralPercent === undefined || user.referralPercent === null) updates.referralPercent = 10;

    if (referredByCode && !user.referredBy) {
      const referrers = await base44.asServiceRole.entities.User.filter({ referralCode: referredByCode });
      const referrer = referrers?.[0];
      if (referrer && referrer.id !== user.id) {
        updates.referredBy = referredByCode;
        await base44.asServiceRole.entities.User.update(referrer.id, {
          referralCount: (referrer.referralCount || 0) + 1,
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.User.update(user.id, updates);
    }

    return Response.json({
      success: true,
      apiKey,
      referralCode,
      referredBy: updates.referredBy || user.referredBy || null,
      referralBalance: updates.referralBalance ?? user.referralBalance ?? 0,
      referralCount: updates.referralCount ?? user.referralCount ?? 0,
      referralPayments: updates.referralPayments ?? user.referralPayments ?? 0,
      referralEarned: updates.referralEarned ?? user.referralEarned ?? 0,
      referralPercent: updates.referralPercent ?? user.referralPercent ?? 10,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});