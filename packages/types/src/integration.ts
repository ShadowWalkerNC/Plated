/**
 * IntegrationProvider — all supported third-party integrations.
 */
export type IntegrationProvider =
  | 'square'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'google'
  | 'apple-maps'
  | 'yelp';

/**
 * IntegrationRecord — stored in Supabase integrations table (SaaS)
 * or encrypted local file (Local Builder).
 * Access tokens are NEVER stored in project.json.
 */
export interface IntegrationRecord {
  id: string;
  siteId: string;
  provider: IntegrationProvider;
  /** Encrypted at rest */
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: string;
  providerAccountId: string;
  /** Provider-specific metadata (page name, location ID, etc.) */
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * OAuthState — passed through OAuth redirect flow.
 */
export interface OAuthState {
  provider: IntegrationProvider;
  siteId: string;
  redirectTo: string;
  csrfToken: string;
}

/**
 * SquareMetadata — typed metadata for Square integration.
 */
export interface SquareMetadata {
  merchantId: string;
  businessName: string;
  locationId: string;
  locationName: string;
  currency: string;
  country: string;
}

/**
 * GoogleMetadata — typed metadata for Google Business integration.
 */
export interface GoogleMetadata {
  accountId: string;
  locationId: string;
  businessName: string;
  address: string;
  placeId?: string;
}

/**
 * MetaMetadata — typed metadata for Facebook/Instagram.
 */
export interface MetaMetadata {
  pageId?: string;
  pageName?: string;
  instagramAccountId?: string;
  instagramUsername?: string;
}
