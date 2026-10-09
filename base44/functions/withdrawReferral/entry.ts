import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const REFERRAL_CREDIT_RATE = 10; // $1 USD = 10 credits

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const withdrawAll = body?.all === true;
    const amount = withdrawAll ? (user.referralBalance || 0) : Number(body?.amount);

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }
    if (amount > (user.referralBalance || 0)) {
      return Response.json({ error: 'Insufficient referral balance', available: user.referralBalance || 0 }, { status: 400 });
    }

    const credits = Math.floor(amount * REFERRAL_CREDIT_RATE);
    if (credits < 1) {
      return Response.json({ error: `Minimum $${(1 / REFERRAL_CREDIT_RATE).toFixed(2)} required to withdraw` }, { status: 400 });
    }

    const newCreditBalance = (user.credits || 0) + credits;
    const newReferralBalance = (user.referralBalance || 0) - amount;

    await base44.asServiceRole.entities.User.update(user.id, {
      credits: newCreditBalance,
      referralBalance: newReferralBalance,
    });

    await base44.entities.CreditTransaction.create({
      action: 'topup',
      credits: credits,
      remainingBalance: newCreditBalance,
      description: `Referral balance withdrawal: $${amount.toFixed(2)} = ${credits} credits`,
      paymentStatus: 'completed',
    });

    await base44.entities.ReferralTransaction.create({
      type: 'withdrawal',
      amountUsd: amount,
      creditsConverted: credits,
      description: `Withdrew $${amount.toFixed(2)} to ${credits} credits`,
    });

    return Response.json({
      success: true,
      withdrawnUsd: amount,
      creditsAdded: credits,
      remainingCredits: newCreditBalance,
      remainingReferralBalance: newReferralBalance,
      rate: REFERRAL_CREDIT_RATE,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});