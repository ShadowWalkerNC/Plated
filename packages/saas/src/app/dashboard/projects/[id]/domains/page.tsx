import { auth }        from '@clerk/nextjs/server';
import { db }          from '@/lib/db/client';
import { customDomains } from '@/lib/db/schema';
import { eq, and }    from 'drizzle-orm';
import { DomainsClient } from '@/components/DomainsClient';
import { canUseCustomDomain } from '@/lib/stripe/gates';

interface Ctx { params: { id: string } }

export default async function DomainsPage({ params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return null;

  const gate = await canUseCustomDomain(userId);

  const domains = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.projectId, params.id), eq(customDomains.userId, userId)));

  return (
    <DomainsClient
      projectId={params.id}
      domains={domains.map((d) => ({
        id:                d.id,
        domain:            d.domain,
        verified:          d.verified,
        verificationToken: d.verificationToken,
        createdAt:         d.createdAt.toISOString(),
      }))}
      canAdd={gate.allowed}
      upgradeReason={gate.allowed ? null : gate.reason ?? null}
    />
  );
}
