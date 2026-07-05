import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProject, deleteProject, updateProjectSchema } from '@/lib/db/queries';
import { apiRatelimit } from '@/lib/ratelimit';

interface Ctx { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await getProject(params.id, userId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await apiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const body = await req.json() as { schema?: unknown; name?: string };
  const updated = await updateProjectSchema(params.id, userId, body.schema as never, body.name);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await deleteProject(params.id, userId);
  return NextResponse.json({ ok: true });
}
