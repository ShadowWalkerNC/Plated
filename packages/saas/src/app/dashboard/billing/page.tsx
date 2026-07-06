import { auth } from '@clerk/nextjs/server';
import { getUserPlan } from '@/lib/stripe/gates';
import { PLANS } from '@/lib/stripe/plans';
import { BillingClient } from '@/components/BillingClient';

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const { plan, sub } = await getUserPlan(userId);

  return (
    <BillingClient
      currentPlanId={plan.id}
      periodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
      cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
      plans={Object.values(PLANS).map((p) => ({
        id:           p.id,
        name:         p.name,
        price:        p.price,
        interval:     p.interval ?? null,
        projectLimit: p.projectLimit,
        deployLimit:  p.deployLimit,
        customDomain: p.customDomain,
        analytics:    p.analytics,
      }))}
    />
  );
}
