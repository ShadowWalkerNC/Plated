import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject, getDeploymentsByProject } from '@/lib/db/queries';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';
import styles from './page.module.css';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return null;

  const [project, deployments] = await Promise.all([
    getProject(params.id, userId),
    getDeploymentsByProject(params.id),
  ]);

  if (!project) notFound();

  const latestDeploy = deployments[0] ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard">Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className={styles.title}>{project.name}</h1>
          <div className={styles.meta}>
            Theme: {project.theme} &nbsp;&middot;&nbsp;
            {project.isPublished ? (
              <span className={styles.badgePublished}>Published</span>
            ) : (
              <span className={styles.badgeDraft}>Draft</span>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Link href={`/dashboard/projects/${project.id}/edit`} className={styles.editBtn}>Edit</Link>
          <Link href={`/dashboard/projects/${project.id}/deploy`} className={styles.deployBtn}>Deploy</Link>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Deployments</h2>
        {deployments.length === 0 ? (
          <div className={styles.empty}>No deployments yet. Hit Deploy to generate and publish your site.</div>
        ) : (
          <div className={styles.deployList}>
            {deployments.map((d) => (
              <div key={d.id} className={styles.deployRow}>
                <div>
                  <div className={styles.deployProvider}>{d.provider}</div>
                  <div className={styles.deployDate}>{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div className={styles.deployRight}>
                  {d.deployUrl && <a href={d.deployUrl} target="_blank" rel="noreferrer" className={styles.deployUrl}>{d.deployUrl}</a>}
                  <span className={[
                    styles.deployStatus,
                    d.status === 'success' ? styles.statusSuccess :
                    d.status === 'failed'  ? styles.statusFailed  : styles.statusPending,
                  ].join(' ')}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Danger zone</h2>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </section>
    </div>
  );
}
