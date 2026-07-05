import { eq, and, desc } from 'drizzle-orm';
import { db } from './client.js';
import { projects, deployments } from './schema.js';
import type { NewProject } from './schema.js';
import type { ProjectSchema } from '@nexcms/types';

export async function getProjectsByUser(userId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function getProject(id: string, userId: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProject(data: NewProject) {
  const rows = await db.insert(projects).values(data).returning();
  return rows[0]!;
}

export async function updateProjectSchema(
  id: string,
  userId: string,
  schema: ProjectSchema,
  name?: string,
) {
  const rows = await db
    .update(projects)
    .set({
      schema,
      ...(name ? { name } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteProject(id: string, userId: string) {
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function getDeploymentsByProject(projectId: string) {
  return db
    .select()
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .orderBy(desc(deployments.createdAt));
}

export async function createDeployment(data: typeof deployments.$inferInsert) {
  const rows = await db.insert(deployments).values(data).returning();
  return rows[0]!;
}

export async function updateDeploymentStatus(
  id: string,
  status: string,
  patch?: { deployUrl?: string; buildLog?: string; filesCount?: number; finishedAt?: Date },
) {
  const rows = await db
    .update(deployments)
    .set({ status, ...patch })
    .where(eq(deployments.id, id))
    .returning();
  return rows[0] ?? null;
}
