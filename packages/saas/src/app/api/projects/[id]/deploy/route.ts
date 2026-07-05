import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProject, createDeployment, updateDeploymentStatus } from '@/lib/db/queries';
import { deployRatelimit } from '@/lib/ratelimit';
import { generate } from '@nexcms/generator';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';

interface Ctx { params: { id: string } }

export async function POST(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await deployRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Deploy rate limit exceeded. Try again later.' }, { status: 429 });

  const project = await getProject(params.id, userId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const deployment = await createDeployment({
    projectId: project.id,
    userId,
    provider: 'download',
    status: 'building',
  });

  let tmpDir: string | null = null;
  try {
    tmpDir = await mkdtemp(join(tmpdir(), 'nexcms-deploy-'));
    const result = await generate(project.schema, tmpDir);

    if (!result.success) {
      await updateDeploymentStatus(deployment.id, 'failed', {
        buildLog: result.errors.join('\n'),
        finishedAt: new Date(),
      });
      return NextResponse.json({ error: 'Build failed', errors: result.errors }, { status: 500 });
    }

    await updateDeploymentStatus(deployment.id, 'success', {
      filesCount: result.filesWritten,
      finishedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      deploymentId: deployment.id,
      filesWritten: result.filesWritten,
      warnings: result.warnings,
    });
  } catch (err) {
    await updateDeploymentStatus(deployment.id, 'failed', {
      buildLog: err instanceof Error ? err.message : String(err),
      finishedAt: new Date(),
    });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  } finally {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
