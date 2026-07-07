import { auth }                from '@clerk/nextjs/server';
import { NextResponse }        from 'next/server';
import { checkAndMarkVerified } from '@/lib/domains/verify';
import { getCustomDomain }     from '@/lib/db/queries';
import { addDomainToVercel, addDomainToNetlify } from '@/lib/domains/providers';

interface Ctx { params: { id: string } }

export async function POST(req: Request, { params: _params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domainId } = await req.json() as { domainId: string };

  const result = await checkAndMarkVerified(domainId, userId);
  if (!result.verified) {
    return NextResponse.json({ verified: false, reason: result.reason });
  }

  // After DNS passes, register the domain with the provider used in the last deploy
  const domainRow = await getCustomDomain(domainId, userId);
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
