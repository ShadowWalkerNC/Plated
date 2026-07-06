import { auth }            from '@clerk/nextjs/server';
import { NextResponse }    from 'next/server';
import { db }              from '@/lib/db/client';
import { subscriptions }   from '@/lib/db/schema';
import { eq }              from 'drizzle-orm';
import { createBillingPortalSession } from '@/lib/stripe/checkout';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { returnUrl } = await req.json() as { returnUrl: string };

  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const sub = rows[0];
  if (!sub) return NextResponse.json({ error: 'No subscription found.' }, { status: 404 });

  const session = await createBillingPortalSession({
    customerId: sub.stripeCustomerId,
    returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
