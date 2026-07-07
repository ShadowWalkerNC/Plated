import { notFound }          from 'next/navigation';
import { generate }          from '@plated/generator';
import { tmpdir }            from 'node:os';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join }              from 'node:path';
import {
  getVerifiedDomainByHost,
  getPublishedProject,
} from '@/lib/db/queries';

interface Params { domain: string; slug?: string[] }

/**
 * Catch-all renderer for custom-domain requests.
 *
 * Flow:
 *   1. Middleware rewrites <custom-domain>/* to /sites/<domain>/*
 *   2. This page resolves domain -> project via DB
 *   3. Generates the site into a tmp dir via @plated/generator
 *   4. Reads the matching HTML file and inlines it as the response
 *
 * Falls back to 404 if:
 *   - domain is not verified
 *   - project is not published
 *   - requested path has no matching generated file
 */
export default async function CustomDomainPage({ params }: { params: Params }) {
  const { domain, slug } = params;

  const domainRow = await getVerifiedDomainByHost(domain);
  if (!domainRow) notFound();

  const project = await getPublishedProject(domainRow.projectId);
  if (!project) notFound();

  // Map the URL path to a file inside the generated output
  const pathSegments = slug ?? [];
  const filePath     =
    pathSegments.length === 0 || pathSegments[pathSegments.length - 1] === ''
      ? 'index.html'
      : pathSegments.join('/').replace(/\.html$/, '') + '.html';

  let tmpDir: string | null = null;
  try {
    tmpDir = await mkdtemp(join(tmpdir(), 'plated-serve-'));
    const result = await generate(project.schema, tmpDir);

    if (!result.success) notFound();

    const targetFile = join(tmpDir, filePath);
    let html: string;
    try {
      html = await readFile(targetFile, 'utf8');
    } catch {
      // Try index.html as a fallback for SPA-style routing
      try {
        html = await readFile(join(tmpDir, 'index.html'), 'utf8');
      } catch {
        notFound();
      }
    }

    // Inject canonical <base> tag so relative asset paths resolve correctly
    const base = `https://${domain}/`;
    const withBase = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${base}">`,
    );

    return new Response(withBase, {
      headers: {
        'Content-Type':  'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } finally {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const domainRow = await getVerifiedDomainByHost(params.domain);
  if (!domainRow) return { title: params.domain };
  const project = await getPublishedProject(domainRow.projectId);
  return { title: project?.name ?? params.domain };
}
