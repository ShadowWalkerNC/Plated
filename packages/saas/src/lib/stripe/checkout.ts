import { stripe } from './client.js';
import { PLANS, type PlanId } from './plans.js';

export async function createCheckoutSession({
  userId,
  email,
  planId,
  returnUrl,
}: {
  userId:    string;
  email:     string;
  planId:    PlanId;
  returnUrl: string;
}) {
  const plan = PLANS[planId];
  if (!plan.priceId) throw new Error(`Plan "${planId}" has no Stripe price.`);

  const session = await stripe.checkout.sessions.create({
    mode:         'subscription',
    payment_method_types: ['card'],
    line_items:   [{ price: plan.priceId, quantity: 1 }],
    success_url:  `${returnUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:   `${returnUrl}?checkout=cancelled`,
    client_reference_id: userId,
    customer_email:      email,
    subscription_data: {
      metadata: { userId, planId },
    },
    metadata: { userId, planId },
  });

  return session;
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl:  string;
}) {
  return stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: returnUrl,
  });
}
