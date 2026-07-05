import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getProjectsByUser } from '@/lib/db/queries';
import styles from './page.module.css';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const projects = await getProjectsByUser(userId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</p>
        </div>
        <Link className={styles.newBtn} href="/dashboard/projects/new">+ New project</Link>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No projects yet</div>
          <p className={styles.emptyBody}>Create your first project to get started.</p>
          <Link className={styles.newBtn} href="/dashboard/projects/new">Create project</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className={styles.card}>
              <div className={styles.cardTheme} data-theme={project.theme} />
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{project.name}</div>
                <div className={styles.cardMeta}>
                  {project.theme} · {project.isPublished ? 'Published' : 'Draft'}
                </div>
                <div className={styles.cardDate}>
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
