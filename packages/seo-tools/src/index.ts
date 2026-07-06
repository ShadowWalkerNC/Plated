// @plated/seo-tools — Phase 1 stub
// Zero external dependencies. Native Node.js only.
// Generates: sitemap.xml, robots.txt, meta tags, Schema.org JSON-LD

import type { ProjectSchema } from '@plated/types';

export interface SitemapOptions {
  baseUrl: string;
  pages: Array<{ path: string; lastmod?: string; changefreq?: string; priority?: number }>;
}

/**
 * generateSitemap — produces sitemap.xml content string.
 */
export function generateSitemap(_options: SitemapOptions): string {
  throw new Error('seo-tools.generateSitemap() not yet implemented. Phase 1.');
}

/**
 * generateRobotsTxt — produces robots.txt content string.
 */
export function generateRobotsTxt(_sitemapUrl: string): string {
  throw new Error('seo-tools.generateRobotsTxt() not yet implemented. Phase 1.');
}

/**
 * generateMetaTags — returns an object of meta tag key/value pairs.
 */
export function generateMetaTags(
  _schema: ProjectSchema,
  _pageTitle: string,
): Record<string, string> {
  throw new Error('seo-tools.generateMetaTags() not yet implemented. Phase 1.');
}

/**
 * generateSchemaOrg — returns a Schema.org JSON-LD object for the business.
 * Supports: Restaurant, FoodTruck, BarOrPub, CafeOrCoffeeShop, Bakery.
 */
export function generateSchemaOrg(
  _schema: ProjectSchema,
): Record<string, unknown> {
  throw new Error('seo-tools.generateSchemaOrg() not yet implemented. Phase 1.');
}
