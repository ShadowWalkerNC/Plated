import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse }       from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { apiRatelimit }          from '@/lib/ratelimit';
import type { PlanId }           from '@/lib/stripe/plans';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await apiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const user      = await currentUser();
  const email     = user?.emailAddresses[0]?.emailAddress ?? '';
  const { planId, returnUrl } = await req.json() as { planId: PlanId; returnUrl: string };

  try {
    const session = await createCheckoutSession({ userId, email, planId, returnUrl });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
