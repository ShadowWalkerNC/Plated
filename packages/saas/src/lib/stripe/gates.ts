import { db } from '../db/client.js';
import { subscriptions } from '../db/schema.js';
import { deployments, projects } from '../db/schema.js';
import { eq, and, gte, count } from 'drizzle-orm';
import { getPlan } from './plans.js';

export async function getUserPlan(userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
    ))
    .limit(1);

  const sub = rows[0] ?? null;
  return {
    sub,
    plan: getPlan(sub?.planId),
  };
}

export async function canCreateProject(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { plan } = await getUserPlan(userId);
  const rows = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, userId));
  const current = rows[0]?.count ?? 0;

  if (current >= plan.projectLimit) {
    return { allowed: false, reason: `Your ${plan.name} plan allows up to ${plan.projectLimit} project${plan.projectLimit === 1 ? '' : 's'}.` };
  }
  return { allowed: true };
}

export async function canDeploy(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { plan } = await getUserPlan(userId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const rows = await db
    .select({ count: count() })
    .from(deployments)
    .where(and(
      eq(deployments.userId, userId),
      gte(deployments.createdAt, startOfMonth),
    ));

  const used = rows[0]?.count ?? 0;
  if (used >= plan.deployLimit) {
    return { allowed: false, reason: `You've used ${used}/${plan.deployLimit} deploys this month on the ${plan.name} plan. Upgrade for more.` };
  }
  return { allowed: true };
}

export async function canUseTheme(userId: string, themeId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { plan } = await getUserPlan(userId);
  const allowed  = (plan.themes as readonly string[]).includes(themeId);
  if (!allowed) {
    return { allowed: false, reason: `The "${themeId}" theme requires a Pro plan or higher.` };
  }
  return { allowed: true };
}
