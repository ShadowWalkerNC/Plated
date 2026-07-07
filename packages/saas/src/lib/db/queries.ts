import { eq, and, desc } from 'drizzle-orm';
import { db }             from './client.js';
import {
  projects, deployments, subscriptions, customDomains,
} from './schema.js';
import type { NewProject } from './schema.js';
import type { ProjectSchema } from '@plated/types';

// ── Projects ───────────────────────────────────────────────────────────────

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

// ── Deployments ───────────────────────────────────────────────────────────

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

// ── Subscriptions ──────────────────────────────────────────────────────────

/**
 * Returns the user’s active (or most recent) subscription row, or null
 * if they have never subscribed. The billing page and canDeploy gate use
 * this to render the current plan.
 */
export async function getSubscription(userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Upsert a subscription row keyed on userId. Called by the Stripe webhook
 * on checkout.session.completed and customer.subscription.updated.
 */
export async function upsertSubscription(
  data: typeof subscriptions.$inferInsert,
) {
  const rows = await db
    .insert(subscriptions)
    .values(data)
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeSubId:        data.stripeSubId,
        planId:             data.planId,
        status:             data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd:   data.currentPeriodEnd,
        cancelAtPeriodEnd:  data.cancelAtPeriodEnd,
        updatedAt:          new Date(),
      },
    })
    .returning();
  return rows[0]!;
}

/**
 * Mark a subscription as canceled and downgrade to the free plan.
 * Called when Stripe fires customer.subscription.deleted.
 */
export async function cancelSubscription(stripeSubId: string) {
  const rows = await db
    .update(subscriptions)
    .set({ status: 'canceled', planId: 'free', cancelAtPeriodEnd: false, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubId, stripeSubId))
    .returning();
  return rows[0] ?? null;
}

// ── Custom domains ──────────────────────────────────────────────────────────

export async function getCustomDomainsByProject(projectId: string) {
  return db
    .select()
    .from(customDomains)
    .where(eq(customDomains.projectId, projectId))
    .orderBy(desc(customDomains.createdAt));
}

/** Fetch a single custom domain with ownership check. */
export async function getCustomDomain(id: string, userId: string) {
  const rows = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.id, id), eq(customDomains.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createCustomDomain(
  data: typeof customDomains.$inferInsert,
) {
  const rows = await db.insert(customDomains).values(data).returning();
  return rows[0]!;
}

/** Mark domain as verified and record the timestamp. */
export async function updateCustomDomainVerified(id: string) {
  const rows = await db
    .update(customDomains)
    .set({ verified: true, verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(customDomains.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCustomDomain(id: string, userId: string) {
  await db
    .delete(customDomains)
    .where(and(eq(customDomains.id, id), eq(customDomains.userId, userId)));
}

// ── User data removal (GDPR / account deletion) ─────────────────────────────

/**
 * Hard-delete all rows owned by userId across every table.
 * Cascades from Drizzle side (projects have ON DELETE CASCADE for
 * deployments and customDomains; subscriptions are deleted explicitly).
 *
 * Called by the Clerk user.deleted webhook.
 */
export async function deleteUserData(userId: string) {
  // Subscriptions don’t cascade from projects, so delete them first.
  await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
  // Projects cascade-delete deployments and customDomains via FK.
  await db.delete(projects).where(eq(projects.userId, userId));
}
