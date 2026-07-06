import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/OnboardingWizard';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const existingProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, userId))
    .limit(1);

  if (existingProjects.length > 0) {
    redirect('/dashboard');
  }

  return <OnboardingWizard />;
}
