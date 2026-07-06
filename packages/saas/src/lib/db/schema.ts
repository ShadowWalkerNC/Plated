import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import type { ProjectSchema } from '@nexcms/types';

export const projects = pgTable(
  'projects',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    userId:      text('user_id').notNull(),
    name:        text('name').notNull().default('Untitled project'),
    slug:        text('slug').notNull(),
    schema:      jsonb('schema').$type<ProjectSchema>().notNull(),
    theme:       text('theme').notNull().default('hearth'),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx:     index('projects_user_id_idx').on(t.userId),
    slugUserIdx: index('projects_slug_user_idx').on(t.slug, t.userId),
  }),
);

export const deployments = pgTable(
  'deployments',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    projectId:  uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    userId:     text('user_id').notNull(),
    provider:   text('provider').notNull(),
    status:     text('status').notNull().default('pending'),
    deployUrl:  text('deploy_url'),
    buildLog:   text('build_log'),
    filesCount: integer('files_count'),
    createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (t) => ({
    projectIdx: index('deployments_project_id_idx').on(t.projectId),
  }),
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id:                 uuid('id').primaryKey().defaultRandom(),
    userId:             text('user_id').notNull().unique(),
    stripeCustomerId:   text('stripe_customer_id').notNull(),
    stripeSubId:        text('stripe_subscription_id').notNull().unique(),
    planId:             text('plan_id').notNull().default('free'),
    status:             text('status').notNull().default('active'),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd:   timestamp('current_period_end',   { withTimezone: true }),
    cancelAtPeriodEnd:  boolean('cancel_at_period_end').notNull().default(false),
    createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:          timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx:     index('subscriptions_user_id_idx').on(t.userId),
    customerIdx: index('subscriptions_customer_id_idx').on(t.stripeCustomerId),
  }),
);

export type Project      = typeof projects.$inferSelect;
export type NewProject   = typeof projects.$inferInsert;
export type Deployment   = typeof deployments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
