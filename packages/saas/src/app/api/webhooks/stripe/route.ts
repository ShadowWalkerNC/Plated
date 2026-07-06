import { NextResponse }  from 'next/server';
import { stripe }        from '@/lib/stripe/client';
import { db }            from '@/lib/db/client';
import { subscriptions } from '@/lib/db/schema';
import { eq }            from 'drizzle-orm';
import type Stripe       from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err instanceof Error ? err.message : 'Unknown'}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId  = session.metadata?.userId;
        const planId  = session.metadata?.planId ?? 'pro';
        const subId   = session.subscription as string;
        const custId  = session.customer as string;
        if (!userId || !subId || !custId) break;

        const sub = await stripe.subscriptions.retrieve(subId);

        await db.insert(subscriptions).values({
          userId,
          stripeCustomerId:   custId,
          stripeSubId:        subId,
          planId,
          status:             sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
          cancelAtPeriodEnd:  sub.cancel_at_period_end,
        }).onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeSubId:        subId,
            planId,
            status:             sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
            cancelAtPeriodEnd:  sub.cancel_at_period_end,
            updatedAt:          new Date(),
          },
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const planId = (sub.metadata?.planId ?? 'pro');

        await db.update(subscriptions)
          .set({
            status:             sub.status,
            planId:             sub.status === 'canceled' ? 'free' : planId,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
            cancelAtPeriodEnd:  sub.cancel_at_period_end,
            updatedAt:          new Date(),
          })
          .where(eq(subscriptions.stripeSubId, sub.id));
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = invoice.subscription as string | null;
        if (!subId) break;
        await db.update(subscriptions)
          .set({ status: 'past_due', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubId, subId));
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = invoice.subscription as string | null;
        if (!subId) break;
        await db.update(subscriptions)
          .set({ status: 'active', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubId, subId));
        break;
      }
    }
  } catch (err) {
    console.error('[stripe-webhook]', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
