import { auth }              from '@clerk/nextjs/server';
import { NextResponse }      from 'next/server';
import { getProjectsByUser } from '@/lib/db/queries';
import { apiRatelimit }      from '@/lib/ratelimit';
import { canCreateProject }  from '@/lib/stripe/gates';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await apiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const projects = await getProjectsByUser(userId);
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await canCreateProject(userId);
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const body = await req.json();
  return NextResponse.json(body); // project creation handled by server action in UI
}
