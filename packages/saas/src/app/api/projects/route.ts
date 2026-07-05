import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProjectsByUser } from '@/lib/db/queries';
import { apiRatelimit } from '@/lib/ratelimit';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await apiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const projects = await getProjectsByUser(userId);
  return NextResponse.json({ projects });
}
