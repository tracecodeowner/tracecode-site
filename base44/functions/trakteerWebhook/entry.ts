import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * Trakteer Webhook Handler
 * Receives payment confirmation from Trakteer and adds credits to user
 * 
 * Webhook structure from Trakteer:
 * {
 *   invoiceId: string,
 *   status: "completed" | "pending" | "failed",
 *   amount: number (in IDR),
 *   email: string,
 *   name: string,
 *   note: string (can contain userId or custom reference),
 *   paymentMethod: string,
 *   createdDate: ISO string,
 *   completedDate?: ISO string,
 *   metadata?: { userId?: string, credits?: number }
 * }
 */

const TRAKTEER_WEBHOOK_TOKEN = Deno.env.get('TRAKTEER_WEBHOOK_TOKEN') || '';

// IDR to USD conversion rate (approximate)
const IDR_TO_USD = 0.000063;

// Map IDR amounts to credit packages
const TRAKTEER_PACKAGES: Record<string, { credits: number; priceUsd: number }> = {
  '10000': { credits: 1, priceUsd: 0.63 },      // ~$0.63
  '50000': { credits: 5, priceUsd: 3.15 },      // ~$3.15
  '100000': { credits: 10, priceUsd: 6.30 },    // ~$6.30
  '250000': { credits: 25, priceUsd: 15.75 },   // ~$15.75
  '500000': { credits: 50, priceUsd: 31.50 },   // ~$31.50
};

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Verify webhook token from headers
    const token = req.headers.get('x-trakteer-token');
    if (token !== TRAKTEER_WEBHOOK_TOKEN) {
      console.error('Invalid webhook token:', token);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, status, amount, email, name, note, paymentMethod, completedDate, metadata } = body;

    console.log('[Trakteer Webhook] Received:', {
      invoiceId,
      status,
      amount,
      email,
      paymentMethod,
      metadata,
    });

    // Only process completed payments
    if (status !== 'completed') {
      console.log(`[Trakteer Webhook] Ignoring status: ${status}`);
      return Response.json({ success: true, message: `Status ${status} — no action` });
    }

    // Get Base44 client
    const base44 = createClientFromRequest(req);

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const user = users?.[0];

    if (!user) {
      console.error(`[Trakteer Webhook] User not found: ${email}`);
      return Response.json({
        success: false,
        error: 'User not found',
        invoiceId,
      }, { status: 404 });
    }

    // Map amount to credits
    const pkg = TRAKTEER_PACKAGES[String(amount)];
    if (!pkg) {
      console.warn(`[Trakteer Webhook] Unknown package amount: ${amount} IDR`);
      // Default: 1 credit per 10000 IDR
      const credits = Math.floor(amount / 10000);
      const priceUsd = amount * IDR_TO_USD;
      await processPayment(base44, user, credits, priceUsd, invoiceId, paymentMethod);
    } else {
      await processPayment(base44, user, pkg.credits, pkg.priceUsd, invoiceId, paymentMethod);
    }

    return Response.json({
      success: true,
      message: 'Webhook processed',
      invoiceId,
      email,
    });
  } catch (error) {
    console.error('[Trakteer Webhook] Error:', error);
    return Response.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
});

async function processPayment(
  base44: any,
  user: any,
  credits: number,
  priceUsd: number,
  invoiceId: string,
  paymentMethod: string
) {
  console.log(`[Trakteer] Processing payment for ${user.email}: +${credits} credits`);

  const newBalance = (user.credits || 0) + credits;

  // Update user credits
  await base44.asServiceRole.entities.User.update(user.id, {
    credits: newBalance,
  });

  // Create transaction record
  await base44.asServiceRole.entities.CreditTransaction.create({
    action: 'topup',
    credits: credits,
    remainingBalance: newBalance,
    amountUsd: priceUsd,
    paymentMethod: 'trakteer',
    paymentStatus: 'completed',
    externalId: invoiceId,
    description: `Trakteer payment via ${paymentMethod}: ${credits} credits ($${priceUsd.toFixed(2)})`,
  });

  console.log(`[Trakteer] ✓ Added ${credits} credits to ${user.email} (ID: ${invoiceId})`);
}
