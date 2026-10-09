import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CREDIT_PACKAGES = {
  starter: { credits: 2, priceUsd: 5, pricePerCredit: 2.50 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { packageKey, action } = body;

    if (action === 'list') {
      return Response.json({ packages: CREDIT_PACKAGES });
    }

    const pkg = CREDIT_PACKAGES[packageKey];
    if (!pkg) {
      return Response.json({ error: 'Invalid package' }, { status: 400 });
    }

    const currentCredits = user.credits || 0;
    const newBalance = currentCredits + pkg.credits;

    await base44.entities.User.update(user.id, { credits: newBalance });

    await base44.entities.CreditTransaction.create({
      action: 'topup',
      credits: pkg.credits,
      remainingBalance: newBalance,
      package: packageKey,
      amountUsd: pkg.priceUsd,
      description: `Credit top-up: ${pkg.credits} credits ($${pkg.priceUsd})`,
      paymentStatus: 'completed',
    });

    // Referral commission
    if (user.referredBy) {
      try {
        const referrers = await base44.asServiceRole.entities.User.filter({ referralCode: user.referredBy });
        const referrer = referrers?.[0];
        if (referrer && referrer.id !== user.id) {
          const percent = referrer.referralPercent || 10;
          const commission = +(pkg.priceUsd * percent / 100).toFixed(2);
          await base44.asServiceRole.entities.User.update(referrer.id, {
            referralBalance: (referrer.referralBalance || 0) + commission,
            referralEarned: (referrer.referralEarned || 0) + commission,
            referralPayments: (referrer.referralPayments || 0) + 1,
          });
          await base44.asServiceRole.entities.ReferralTransaction.create({
            type: 'earning',
            amountUsd: commission,
            referredEmail: user.email,
            percent: percent,
            description: `Referral commission: ${percent}% of $${pkg.priceUsd} top-up by ${user.email}`,
          });
        }
      } catch (refErr) {
        console.error('Referral processing failed:', refErr);
      }
    }

    return Response.json({
      success: true,
      creditsAdded: pkg.credits,
      remainingCredits: newBalance,
      package: packageKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});