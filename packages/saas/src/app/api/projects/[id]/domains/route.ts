import { auth }               from '@clerk/nextjs/server';
import { NextResponse }       from 'next/server';
import { canUseCustomDomain } from '@/lib/stripe/gates';
import {
  getCustomDomainsByProject,
  createCustomDomain,
  deleteCustomDomain,
} from '@/lib/db/queries';
import { randomBytes } from 'node:crypto';

interface Ctx { params: { id: string } }

// GET - list domains for a project
export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const domains = await getCustomDomainsByProject(params.id);
  // filter to caller's own domains (belt-and-suspenders ownership check)
  return NextResponse.json({ domains: domains.filter((d) => d.userId === userId) });
}

// POST - add a new custom domain
export async function POST(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await canUseCustomDomain(userId);
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const { domain } = await req.json() as { domain: string };
  const cleaned = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  if (!isValidDomain(cleaned)) {
    return NextResponse.json({ error: 'Invalid domain name.' }, { status: 400 });
  }

  const token     = randomBytes(20).toString('hex');
  const domainRow = await createCustomDomain({
    projectId:         params.id,
    userId,
    domain:            cleaned,
    verificationToken: token,
  });

  return NextResponse.json({ domain: domainRow }, { status: 201 });
}

// DELETE - remove a domain
export async function DELETE(req: Request, _ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domainId } = await req.json() as { domainId: string };
  await deleteCustomDomain(domainId, userId);

  return NextResponse.json({ ok: true });
}

function isValidDomain(d: string): boolean {
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d);
}
