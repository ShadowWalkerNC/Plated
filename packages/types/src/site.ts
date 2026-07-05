/**
 * SiteRecord — the SaaS database representation of a deployed site.
 * Maps to the Supabase `sites` table.
 */
export interface SiteRecord {
  id: string;
  ownerUserId: string;
  subdomain: string;
  customDomain?: string;
  businessType: string;
  styleTemplate: string;
  colorTheme: string;
  tier: SiteTier;
  managedBy?: string;
  billingStatus: BillingStatus;
  /** Full ProjectSchema stored as JSONB */
  projectData: Record<string, unknown>;
  status: SiteStatus;
  createdAt: string;
  updatedAt: string;
}

export type SiteTier = 'self_serve' | 'managed' | 'white_glove';
export type BillingStatus = 'active' | 'paused' | 'cancelled';
export type SiteStatus = 'draft' | 'published';

/**
 * ContentPostRecord — Supabase content_posts table row.
 */
export interface ContentPostRecord {
  id: string;
  site