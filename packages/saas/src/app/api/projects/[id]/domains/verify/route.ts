import { auth }                from '@clerk/nextjs/server';
import { NextResponse }        from 'next/server';
import { checkAndMarkVerified } from '@/lib/domains/verify';
import { db }                  from '@/lib/db/client';
import { customDomains }       from '@/lib/db/schema';
import { eq, and }             from 'drizzle-orm';
import { addDomainToVercel, addDomainToNetlify } from '@/lib/domains/providers';

interface Ctx { params: { id: string } }

export async function POST(req: Request, { params: _params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domainId } = await req.json() as { domainId: string };

  const result = await checkAndMarkVerified(domainId, userId);
  if (!result.verified) {
    return NextResponse.json({ verified: false, reason: result.reason }, { status: 200 });
  }

  // After verification, push domain to the last-used deploy provider if known
  const rows = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.userId, userId)))
    .limit(1);

  const domainRow = rows[0];
  if (domainRow?.provider && domainRow?.providerDomainId) {
    if (domainRow.provider === 'vercel') {
      await addDomainToVercel(domainRow.domain, domainRow.providerDomainId).catch(() => {});
    }
    if (domainRow.provider === 'netlify') {
      await addDomainToNetlify(domainRow.domain, domainRow.providerDomainId).catch(() => {});
    }
  }

  return NextResponse.json({ verified: true });
}
