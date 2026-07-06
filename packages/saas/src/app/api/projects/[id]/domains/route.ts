import { auth }           from '@clerk/nextjs/server';
import { NextResponse }   from 'next/server';
import { db }             from '@/lib/db/client';
import { customDomains }  from '@/lib/db/schema';
import { eq, and }        from 'drizzle-orm';
import { canUseCustomDomain } from '@/lib/stripe/gates';
import { randomBytes }    from 'node:crypto';

interface Ctx { params: { id: string } }

// GET — list domains for a project
export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.projectId, params.id), eq(customDomains.userId, userId)));

  return NextResponse.json({ domains: rows });
}

// POST — add a new domain
export async function POST(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await canUseCustomDomain(userId);
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const { domain } = await req.json() as { domain: string };
  const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!isValidDomain(cleaned)) {
    return NextResponse.json({ error: 'Invalid domain name.' }, { status: 400 });
  }

  const token = randomBytes(20).toString('hex');

  const rows = await db.insert(customDomains).values({
    projectId:         params.id,
    userId,
    domain:            cleaned,
    verificationToken: token,
  }).returning();

  return NextResponse.json({ domain: rows[0] }, { status: 201 });
}

// DELETE — remove a domain
export async function DELETE(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domainId } = await req.json() as { domainId: string };

  await db.delete(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.userId, userId)));

  return NextResponse.json({ ok: true });
}

function isValidDomain(d: string): boolean {
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d);
}
