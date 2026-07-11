/**
 * @plated/seo-tools
 *
 * Pure TypeScript SEO utilities — no external dependencies, no I/O.
 * Every function accepts typed inputs and returns a plain string or
 * plain object that callers can write to disk or embed in templates.
 *
 * Exports:
 *   generateSitemap()    — produces a sitemap.xml string
 *   generateRobotsTxt()  — produces a robots.txt string
 *   generateMetaTags()   — produces an HTML <meta> key/value map
 *   generateSchemaOrg()  — produces a Schema.org JSON-LD graph object
 */

import type { ProjectSchema } from '@plated/types';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Ensures a base URL never has a trailing slash. */
function normaliseBase(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/** XML-escapes the five reserved characters. */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
// generateSitemap
// ---------------------------------------------------------------------------

/** Valid values for the <changefreq> element (per the Sitemap protocol). */
export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/** A single URL entry in the sitemap. */
export interface SitemapUrl {
  /** Page path relative to the site root, e.g. "/menu" or "/". */
  path: string;
  /**
   * ISO-8601 date string for the last modification time, e.g.
   * "2026-07-06" or "2026-07-06T21:00:00Z".
   */
  lastmod?: string | undefined;
  /** How frequently the page is likely to change. */
  changefreq?: ChangeFreq | undefined;
  /**
   * Priority relative to other URLs on the same site.
   * Clamped to [0.0, 1.0]; serialised to one decimal place.
   */
  priority?: number | undefined;
}

export interface SitemapOptions {
  /** Fully-qualified base URL, e.g. "https://example.com". */
  baseUrl: string;
  /** Ordered list of pages to include. */
  urls: SitemapUrl[];
}

/**
 * generateSitemap — produces a well-formed sitemap.xml string.
 *
 * Follows the Sitemap Protocol 0.9 (https://www.sitemaps.org/protocol.html).
 * All URL values are XML-escaped so special characters in paths are safe.
 */
export function generateSitemap(options: SitemapOptions): string {
  const base = normaliseBase(options.baseUrl);

  const urlElements = options.urls.map((u: SitemapUrl): string => {
    const loc = xmlEscape(`${base}${u.path.startsWith('/') ? '' : '/'}${u.path}`);
    const lastmod    = u.lastmod    ? `\n    <lastmod>${xmlEscape(u.lastmod)}</lastmod>` : '';
    const changefreq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '';
    const priority   = u.priority !== undefined
      ? `\n    <priority>${Math.min(1, Math.max(0, u.priority)).toFixed(1)}</priority>`
      : '';
    return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlElements,
    '</urlset>',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// generateRobotsTxt
// ---------------------------------------------------------------------------

/** A single User-agent directive block. */
export interface RobotsDirective {
  /** User-agent selector, e.g. "*" or "Googlebot". */
  userAgent: string;
  /** Paths to disallow (default: []). */
  disallow?: string[] | undefined;
  /** Paths to explicitly allow (default: []). */
  allow?: string[] | undefined;
  /** Crawl-delay in seconds (omitted if undefined). */
  crawlDelay?: number | undefined;
}

export interface RobotsTxtOptions {
  /**
   * Primary sitemap URL, included as a top-level Sitemap directive.
   * e.g. "https://example.com/sitemap.xml"
   */
  sitemapUrl: string;
  /**
   * One or more User-agent directive blocks.
   * Defaults to a single wildcard block that allows everything.
   */
  directives?: RobotsDirective[] | undefined;
  /** Additional Sitemap directives appended after the primary one. */
  additionalSitemaps?: string[] | undefined;
  /**
   * When true, emits "X-Robots-Tag: noindex" as a comment header.
   * Useful for staging environments.
   */
  noindex?: boolean | undefined;
}

/**
 * generateRobotsTxt — produces a robots.txt string.
 *
 * Follows the Robots Exclusion Protocol and Google's extensions.
 * Always includes the primary sitemap as a top-level Sitemap directive.
 */
export function generateRobotsTxt(options: RobotsTxtOptions): string {
  const lines: string[] = [];

  if (options.noindex) {
    lines.push('# X-Robots-Tag: noindex');
    lines.push('');
  }

  const directives: RobotsDirective[] =
    options.directives ?? [{ userAgent: '*', disallow: [], allow: ['/'] }];

  for (const directive of directives) {
    lines.push(`User-agent: ${directive.userAgent}`);
    for (const path of directive.allow   ?? []) lines.push(`Allow: ${path}`);
    for (const path of directive.disallow ?? []) lines.push(`Disallow: ${path}`);
    if (directive.crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${directive.crawlDelay}`);
    }
    lines.push('');
  }

  lines.push(`Sitemap: ${options.sitemapUrl}`);
  for (const s of options.additionalSitemaps ?? []) {
    lines.push(`Sitemap: ${s}`);
  }
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// generateMetaTags
// ---------------------------------------------------------------------------

/** Valid values for the twitter:card meta tag. */
export type TwitterCard =
  | 'summary'
  | 'summary_large_image'
  | 'app'
  | 'player';

/** Valid values for the robots meta directive. */
export type RobotsDirectiveValue =
  | 'index'
  | 'noindex'
  | 'follow'
  | 'nofollow'
  | 'noarchive'
  | 'nosnippet';

export interface MetaTagOptions {
  /**
   * Overrides the page title constructed from the schema.
   * Falls back to "<businessName> | <seoTitle>" if omitted.
   */
  pageTitle?: string | undefined;
  /**
   * Overrides the page meta description.
   * Falls back to schema.seo.metaDescription if omitted.
   */
  pageDescription?: string | undefined;
  /** Canonical URL for this page. */
  canonicalUrl?: string | undefined;
  /** Override for the OG image URL. Falls back to schema.seo.ogImageUrl. */
  ogImageUrl?: string | undefined;
  /** Twitter card type. Defaults to 'summary_large_image'. */
  twitterCard?: TwitterCard | undefined;
  /** BCP-47 locale string, e.g. "en_US". Defaults to 'en_US'. */
  locale?: string | undefined;
  /** Space-separated robots meta directives, e.g. "index, follow". */
  robots?: string | undefined;
}

/**
 * generateMetaTags — produces a flat Record of meta tag name/property → content.
 *
 * Keys use the standard HTML meta name or Open Graph property attribute value.
 * Consumers render them as:
 *   <meta name="{key}" content="{value}" />   (for standard keys)
 *   <meta property="{key}" content="{value}" /> (for og:* / article:* keys)
 *
 * Empty-string values are omitted from the output object.
 */
export function generateMetaTags(
  schema:  ProjectSchema,
  options: MetaTagOptions = {},
): Record<string, string> {
  const businessName  = schema.business.name ?? '';
  const seoTitle      = schema.seo?.siteTitle      ?? businessName;
  const seoDesc       = schema.seo?.metaDescription ?? '';
  const ogImage       = options.ogImageUrl ?? schema.seo?.ogImageUrl ?? '';
  const twitterCard   = options.twitterCard ?? 'summary_large_image';
  const locale        = options.locale      ?? 'en_US';

  const pageTitle = options.pageTitle
    ?? (businessName && seoTitle && businessName !== seoTitle
        ? `${businessName} | ${seoTitle}`
        : seoTitle);

  const description = options.pageDescription || seoDesc;

  const tags: Record<string, string> = {};

  const set = (key: string, value: string | undefined | null): void => {
    if (value) tags[key] = value;
  };

  // ── Standard HTML meta ───────────────────────────────────────────────────
  set('title',             pageTitle);
  set('description',       description);
  set('robots',            options.robots ?? 'index, follow');
  set('author',            businessName);

  // ── Canonical ─────────────────────────────────────────────────────────────
  if (options.canonicalUrl) set('canonical', options.canonicalUrl);

  // ── Open Graph ────────────────────────────────────────────────────────────
  set('og:type',           'website');
  set('og:title',          pageTitle);
  set('og:description',    description);
  set('og:locale',         locale);
  if (options.canonicalUrl) set('og:url', options.canonicalUrl);
  if (ogImage)              set('og:image', ogImage);

  // ── Twitter Card ──────────────────────────────────────────────────────────
  set('twitter:card',      twitterCard);
  set('twitter:title',     pageTitle);
  set('twitter:description', description);
  if (ogImage) set('twitter:image', ogImage);

  // ── Verification codes ────────────────────────────────────────────────────
  if (schema.seo?.googleVerification) {
    set('google-site-verification', schema.seo.googleVerification);
  }
  if (schema.seo?.bingVerification) {
    set('msvalidate.01', schema.seo.bingVerification);
  }

  return tags;
}

// ---------------------------------------------------------------------------
// generateSchemaOrg
// ---------------------------------------------------------------------------

/**
 * Map from ProjectSchema.businessType to Schema.org @type values.
 * Uses the most specific applicable type.
 */
const SCHEMA_ORG_TYPE_MAP: Readonly<Record<string, string>> = {
  restaurant:    'Restaurant',
  cafe:          'CafeOrCoffeeShop',
  bar:           'BarOrPub',
  bakery:        'Bakery',
  catering:      'FoodService',
  'food-truck':  'FoodTruck',
  'food-stand':  'FoodEstablishment',
  'ghost-kitchen': 'FoodService',
} as const;

/**
 * Schema.org day-of-week URI map (Sunday = 0, Saturday = 6).
 * Per https://schema.org/DayOfWeek
 */
const DAY_OF_WEEK: Readonly<Record<number, string>> = {
  0: 'https://schema.org/Sunday',
  1: 'https://schema.org/Monday',
  2: 'https://schema.org/Tuesday',
  3: 'https://schema.org/Wednesday',
  4: 'https://schema.org/Thursday',
  5: 'https://schema.org/Friday',
  6: 'https://schema.org/Saturday',
} as const;

/** Schema.org PostalAddress */
export interface PostalAddressSchema {
  '@type': 'PostalAddress';
  streetAddress?:   string;
  addressLocality?: string;
  addressRegion?:   string;
  postalCode?:      string;
  addressCountry?:  string;
}

/** Schema.org OpeningHoursSpecification */
export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string;
  opens:  string;
  closes: string;
}

/** A single node in a Schema.org JSON-LD @graph. */
export interface SchemaOrgEntity {
  '@type': string;
  '@id'?:       string;
  name:         string;
  description?: string;
  url?:         string;
  telephone?:   string;
  email?:       string;
  image?:       string;
  servesCuisine?: string;
  hasMap?:        string;
  address?:       PostalAddressSchema;
  openingHoursSpecification?: OpeningHoursSpecification[];
  sameAs?: string[];
  [key: string]: unknown;
}

/** Top-level Schema.org JSON-LD wrapper. */
export interface SchemaOrgGraph {
  '@context': 'https://schema.org';
  '@graph':   SchemaOrgEntity[];
}

/**
 * generateSchemaOrg — produces a Schema.org JSON-LD graph object.
 *
 * Includes:
 *   - The correct @type for the business (Restaurant, FoodTruck, etc.)
 *   - name, description, telephone, email, url, image
 *   - address (PostalAddress) from the primary location
 *   - openingHoursSpecification from the primary location's schedule
 *   - servesCuisine, hasMap (Google Maps URL)
 *   - sameAs array from non-empty social profile URLs
 *
 * Returns a plain object — callers embed it as:
 *   <script type="application/ld+json">
 *     {JSON.stringify(result)}
 *   </script>
 */
export function generateSchemaOrg(schema: ProjectSchema): SchemaOrgGraph {
  const schemaType =
    SCHEMA_ORG_TYPE_MAP[schema.businessType] ?? 'FoodEstablishment';

  const loc = schema.locations?.[schema.primaryLocationIndex]
            ?? schema.locations?.[0]
            ?? null;

  // ── Address ──────────────────────────────────────────────────────────────
  const address: PostalAddressSchema | undefined = loc
    ? {
        '@type':          'PostalAddress',
        streetAddress:    [loc.address1, loc.address2].filter(Boolean).join(', ') || undefined,
        addressLocality:  loc.city     || undefined,
        addressRegion:    loc.state    || undefined,
        postalCode:       loc.zip      || undefined,
        addressCountry:   loc.country  || undefined,
      } as any
    : undefined;

  // ── Opening hours ─────────────────────────────────────────────────────────
  const openingHoursSpecification: OpeningHoursSpecification[] = [];

  if (loc?.hours?.schedule) {
    for (const day of loc.hours.schedule) {
      if (
        day.open &&
        day.openTime !== undefined &&
        day.closeTime !== undefined &&
        DAY_OF_WEEK[day.day] !== undefined
      ) {
        openingHoursSpecification.push({
          '@type':   'OpeningHoursSpecification',
          dayOfWeek: DAY_OF_WEEK[day.day]!,
          opens:     day.openTime,
          closes:    day.closeTime,
        });
      }
    }
  }

  // ── sameAs — collect non-empty social URLs ────────────────────────────────
  const social = schema.social ?? {};
  const sameAs: string[] = Object.values(social as Record<string, unknown>)
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

  // ── Site URL ──────────────────────────────────────────────────────────────
  const subdomain    = schema.deployment?.subdomain ?? '';
  const customDomain = schema.deployment?.customDomain ?? '';
  const siteUrl = customDomain
    ? `https://${customDomain}`
    : subdomain
    ? `https://${subdomain}.plated.app`
    : undefined;

  // ── Assemble entity ───────────────────────────────────────────────────────
  const entity: SchemaOrgEntity = {
    '@type': schemaType,
    name:    schema.business.name,
  };

  if (schema.business.description) entity.description    = schema.business.description;
  if (siteUrl)                      entity.url             = siteUrl;
  if (schema.business.phone)        entity.telephone       = schema.business.phone;
  if (schema.business.email)        entity.email           = schema.business.email;
  if (schema.branding?.heroImageUrl) entity.image          = schema.branding.heroImageUrl;
  if (schema.business.cuisineType)  entity.servesCuisine  = schema.business.cuisineType;
  if (loc?.googleMapsUrl)           entity.hasMap          = loc.googleMapsUrl;
  if (address)                       entity.address         = address;
  if (openingHoursSpecification.length > 0) {
    entity.openingHoursSpecification = openingHoursSpecification;
  }
  if (sameAs.length > 0) entity.sameAs = sameAs;

  return {
    '@context': 'https://schema.org',
    '@graph':   [entity],
  };
}
