import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { canCreateProject } from '@/lib/stripe/gates';

interface Payload {
  restaurantName: string;
  cuisine: string;
  city: string;
  description: string;
  theme: 'hearth' | 'editorial' | 'bistro';
  wantsReservations: boolean;
  wantsOnlineOrdering: boolean;
  primaryCta: 'book' | 'order' | 'call' | 'visit';
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await canCreateProject(userId);
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason ?? 'Project limit reached' }, { status: 403 });
  }

  const body = await req.json() as Payload;

  if (!body.restaurantName?.trim() || !body.cuisine?.trim() || !body.city?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const slug = slugify(body.restaurantName);
  const schema = {
    business: {
      name: body.restaurantName.trim(),
      city: body.city.trim(),
      description: body.description.trim(),
      cuisine: body.cuisine.trim(),
    },
    site: {
      primaryCta: body.primaryCta,
      wantsReservations: body.wantsReservations,
      wantsOnlineOrdering: body.wantsOnlineOrdering,
    },
    onboarding: {
      completed: true,
      completedAt: new Date().toISOString(),
      source: 'wizard',
    },
  };

  const inserted = await db.insert(projects).values({
    id: randomUUID(),
    userId,
    name: body.restaurantName.trim(),
    slug,
    theme: body.theme,
    schema,
    isPublished: false,
  }).returning({ id: projects.id });

  return NextResponse.json({ ok: true, projectId: inserted[0]?.id });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'restaurant-site';
}
