import type { BusinessType, StyleTemplate, ColorTheme } from './template.js';

export type SiteMode = 'saas' | 'local';
export type SiteStatus = 'draft' | 'published' | 'suspended';

/**
 * SiteRecord — Supabase `sites` table row shape.
 * Used server-side in the SaaS Hub only.
 */
export interface SiteRecord {
  id: string;
  ownerUserId: string;
  subdomain: string;
  customDomain: string | null;
  businessType: BusinessType;
  styleTemplate: StyleTemplate;
  colorTheme: ColorTheme;
  mode: SiteMode;
  /** Full ProjectSchema stored as JSONB */
  projectData: Record<string, unknown>;
  status: SiteStatus;
  createdAt: string;
  updatedAt: string;
}
