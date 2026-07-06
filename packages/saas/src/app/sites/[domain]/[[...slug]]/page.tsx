import { notFound }    from 'next/navigation';
import { db }          from '@/lib/db/client';
import { customDomains, projects } from '@/lib/db/schema';
import { eq, and }    from 'drizzle-orm';

interface Params { domain: string; slug?: string[] }

/**
 * Catch-all renderer for custom-domain requests.
 * The middleware rewrites incoming custom-domain traffic to /sites/[domain]/[...slug].
 * This page looks up the domain, loads the project schema, and renders the appropriate page.
 */
export default async function CustomDomainPage({ params }: { params: Params }) {
  const { domain, slug } = params;

  const domainRows = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.domain, domain), eq(customDomains.verified, true)))
    .limit(1);

  const domainRow = domainRows[0];
  if (!domainRow) notFound();

  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, domainRow.projectId))
    .limit(1);

  const project = projectRows[0];
  if (!project || !project.isPublished) notFound();

  const path = '/' + (slug?.join('/') ?? '');

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{project.name}</title>
        <meta httpEquiv="refresh" content={`0; url=https://${project.slug}.plated.io${path}`} />
      </head>
      <body style={{ margin: 0, background: '#f5f0ea', display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <p style={{ color: '#7a6254' }}>Redirecting to <a href={`https://${project.slug}.plated.io${path}`}>{project.name}</a>…</p>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  return { title: params.domain };
}
