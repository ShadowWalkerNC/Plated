import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import styles from './page.module.css';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const existingProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, userId))
    .limit(1);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Dashboard</p>
          <h1 className={styles.title}>Your restaurant sites</h1>
          <p className={styles.subtitle}>Create, publish, and manage restaurant websites from one place.</p>
        </div>
        {existingProjects.length === 0 ? (
          <Link className={styles.primaryCta} href="/onboarding">
            Start onboarding
          </Link>
        ) : (
          <Link className={styles.primaryCta} href="/dashboard/projects">
            View projects
          </Link>
        )}
      </section>
    </div>
  );
}
