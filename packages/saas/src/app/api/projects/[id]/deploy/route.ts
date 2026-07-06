import { auth }              from '@clerk/nextjs/server';
import { NextResponse }      from 'next/server';
import { getProject, createDeployment, updateDeploymentStatus } from '@/lib/db/queries';
import { deployRatelimit }   from '@/lib/ratelimit';
import { canDeploy, canUseTheme, getUserPlan } from '@/lib/stripe/gates';
import { generate }          from '@plated/generator';
import { sendDeploySuccess, sendDeployFailure } from '@/lib/email/send';
import { currentUser }       from '@clerk/nextjs/server';
import { tmpdir }            from 'node:os';
import { mkdtemp, rm }       from 'node:fs/promises';
import { join }              from 'node:path';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.plated.io';
interface Ctx  { params: { id: string } }

async function deployToVercel(slug: string, outputDir: string): Promise<string> {
  const token  = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error('VERCEL_TOKEN is not configured.');
  const { readdir, readFile } = await import('node:fs/promises');
  async function collectFiles(dir: string, base = ''): Promise<Array<{ file: string; data: string; encoding: 'base64' }>> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: Array<{ file: string; data: string; encoding: 'base64' }> = [];
    for (const entry of entries) {
      const rel  = base ? `${base}/${entry.name}` : entry.name;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await collectFiles(full, rel));
      else { const data = await readFile(full); files.push({ file: rel, data: data.toString('base64'), encoding: 'base64' }); }
    }
    return files;
  }
  const files = await collectFiles(outputDir);
  const qs    = teamId ? `?teamId=${teamId}` : '';
  const res   = await fetch(`https://api.vercel.com/v13/deployments${qs}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: slug, files, projectSettings: { framework: 'astro' } }),
  });
  if (!res.ok) { const e = await res.json() as { error?: { message?: string } }; throw new Error(e?.error?.message ?? 'Vercel deploy failed.'); }
  const data = await res.json() as { url?: string };
  return `https://${data.url ?? ''}`;
}

async function deployToNetlify(slug: string, outputDir: string): Promise<string> {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) throw new Error('NETLIFY_TOKEN is not configured.');
  const { readdir, readFile } = await import('node:fs/promises');
  const crypto = await import('node:crypto');
  const siteRes = await fetch('https://api.netlify.com/api/v1/sites', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: slug }) });
  if (!siteRes.ok) throw new Error('Failed to create Netlify site.');
  const site = await siteRes.json() as { id: string; ssl_url?: string; url?: string };
  async function collectDigests(dir: string, base = ''): Promise<Record<string, string>> {
    const entries = await readdir(dir, { withFileTypes: true });
    const map: Record<string, string> = {};
    for (const entry of entries) {
      const rel = base ? `${base}/${entry.name}` : `/${entry.name}`;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) Object.assign(map, await collectDigests(full, rel));
      else { const data = await readFile(full); map[rel] = crypto.createHash('sha1').update(data).digest('hex'); }
    }
    return map;
  }
  const fileMap   = await collectDigests(outputDir);
  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ files: fileMap }) });
  if (!deployRes.ok) throw new Error('Failed to create Netlify deploy.');
  const deploy = await deployRes.json() as { id: string; required?: string[] };
  for (const sha of deploy.required ?? []) {
    const filePath = Object.keys(fileMap).find((k) => fileMap[k] === sha);
    if (!filePath) continue;
    const data = await readFile(join(outputDir, filePath));
    await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files${filePath}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream', 'Content-Length': String(data.length) }, body: data });
  }
  return site.ssl_url ?? site.url ?? `https://${slug}.netlify.app`;
}

export async function POST(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rateLimitOk = await deployRatelimit.limit(userId);
  if (!rateLimitOk.success) return NextResponse.json({ error: 'Deploy rate limit exceeded.' }, { status: 429 });

  const deployGate = await canDeploy(userId);
  if (!deployGate.allowed) return NextResponse.json({ error: deployGate.reason }, { status: 403 });

  const project = await getProject(params.id, userId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const themeGate = await canUseTheme(userId, project.theme);
  if (!themeGate.allowed) return NextResponse.json({ error: themeGate.reason }, { status: 403 });

  const body       = await req.json() as { provider?: string };
  const provider   = body.provider ?? 'download';
  const deployment = await createDeployment({ projectId: project.id, userId, provider, status: 'building' });

  const userEmail = await currentUser().then((u) => u?.emailAddresses[0]?.emailAddress ?? null).catch(() => null);
  const dashboardUrl = `${BASE_URL}/dashboard/projects/${project.id}`;

  let tmpDir: string | null = null;
  try {
    tmpDir = await mkdtemp(join(tmpdir(), 'plated-deploy-'));
    const result = await generate(project.schema, tmpDir);
    if (!result.success) {
      await updateDeploymentStatus(deployment.id, 'failed', { buildLog: result.errors.join('\n'), finishedAt: new Date() });
      if (userEmail) {
        await sendDeployFailure(userEmail, { projectName: project.name, provider, errorMessage: result.errors[0] ?? 'Build failed', dashboardUrl }).catch(() => {});
      }
      return NextResponse.json({ error: 'Build failed', errors: result.errors }, { status: 500 });
    }

    let deployUrl: string | undefined;
    if (provider === 'vercel')  deployUrl = await deployToVercel(project.slug, tmpDir);
    if (provider === 'netlify') deployUrl = await deployToNetlify(project.slug, tmpDir);

    await updateDeploymentStatus(deployment.id, 'success', { filesCount: result.filesWritten, deployUrl, finishedAt: new Date() });

    if (userEmail && deployUrl) {
      await sendDeploySuccess(userEmail, { projectName: project.name, provider, deployUrl, filesWritten: result.filesWritten, dashboardUrl }).catch(() => {});
    }

    return NextResponse.json({ ok: true, deploymentId: deployment.id, filesWritten: result.filesWritten, warnings: result.warnings, deployUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    await updateDeploymentStatus(deployment.id, 'failed', { buildLog: msg, finishedAt: new Date() });
    if (userEmail) {
      await sendDeployFailure(userEmail, { projectName: project.name, provider, errorMessage: msg, dashboardUrl }).catch(() => {});
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
