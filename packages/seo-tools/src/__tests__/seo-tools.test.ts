import { describe, it, expect } from 'vitest';
import {
  generateSitemap,
  generateRobotsTxt,
  generateMetaTags,
  generateSchemaOrg,
} from '../index.js';
import type { ProjectSchema } from '@plated/types';

// ---------------------------------------------------------------------------
// Shared minimal schema fixture
// ---------------------------------------------------------------------------

const SCHEMA: ProjectSchema = {
  id:             'seo-test-001',
  schemaVersion:  '2.0',
  createdAt:      '2026-01-01T00:00:00Z',
  updatedAt:      '2026-01-01T00:00:00Z',
  businessType:   'restaurant',
  styleTemplate:  'hearth',
  colorTheme:     'default',
  darkMode:       false,
  business: {
    name:        'The Rusty Fork',
    tagline:     'Food worth driving for.',
    description: 'A cosy neighbourhood bistro.',
    phone:       '555-0100',
    email:       'hello@rustyfork.com',
    cuisineType: 'American',
  },
  branding: {
    primaryColor:   '#8a4b2f',
    secondaryColor: '#f4ede4',
    accentColor:    '#c98f4a',
    heroImageUrl:   'https://cdn.example.com/hero.jpg',
  },
  seo: {
    siteTitle:       'The Rusty Fork — American Bistro',
    metaDescription: 'Great American food in the heart of town.',
    ogImageUrl:      'https://cdn.example.com/og.jpg',
    googleVerification: 'abc123',
    bingVerification:   'xyz456',
  },
  social: {
    instagram: 'https://instagram.com/rustyfork',
    facebook:  'https://facebook.com/rustyfork',
    twitter:   '',
    tiktok:    '',
  },
  integrations: {},
  locations: [
    {
      id:       'loc-main',
      name:     'Main',
      address1: '12 Oak Street',
      address2: 'Suite 1',
      city:     'Raleigh',
      state:    'NC',
      zip:      '27601',
      country:  'US',
      phone:    '555-0100',
      email:    'hello@rustyfork.com',
      googleMapsUrl: 'https://maps.google.com/?q=12+Oak+Street',
      hours: {
        holidayNote: '',
        schedule: [
          { day: 0, open: false },
          { day: 1, open: true,  openTime: '11:00', closeTime: '21:00' },
          { day: 2, open: true,  openTime: '11:00', closeTime: '21:00' },
          { day: 3, open: true,  openTime: '11:00', closeTime: '21:00' },
          { day: 4, open: true,  openTime: '11:00', closeTime: '21:00' },
          { day: 5, open: true,  openTime: '11:00', closeTime: '22:00' },
          { day: 6, open: true,  openTime: '12:00', closeTime: '21:00' },
        ],
      },
    },
  ],
  primaryLocationIndex: 0,
  menu: { categories: [] },
  extensions: {},
  deployment: {
    subdomain:    'rustyfork',
    customDomain: '',
  },
};

// ---------------------------------------------------------------------------
// generateSitemap
// ---------------------------------------------------------------------------

describe('generateSitemap', () => {
  it('returns a string starting with the XML declaration', () => {
    const xml = generateSitemap({ baseUrl: 'https://example.com', urls: [] });
    expect(xml).toMatch(/^<\?xml version="1.0"/);
  });

  it('includes the sitemap 0.9 namespace', () => {
    const xml = generateSitemap({ baseUrl: 'https://example.com', urls: [] });
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  });

  it('includes a <url> element for each entry', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [
        { path: '/' },
        { path: '/menu' },
        { path: '/contact' },
      ],
    });
    const matches = xml.match(/<url>/g);
    expect(matches).toHaveLength(3);
  });

  it('constructs the full <loc> URL correctly', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/menu' }],
    });
    expect(xml).toContain('<loc>https://example.com/menu</loc>');
  });

  it('strips a trailing slash from baseUrl', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com/',
      urls: [{ path: '/about' }],
    });
    expect(xml).toContain('<loc>https://example.com/about</loc>');
  });

  it('includes <lastmod> when provided', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/', lastmod: '2026-07-06' }],
    });
    expect(xml).toContain('<lastmod>2026-07-06</lastmod>');
  });

  it('omits <lastmod> when not provided', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/' }],
    });
    expect(xml).not.toContain('<lastmod>');
  });

  it('includes <changefreq> when provided', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/', changefreq: 'weekly' }],
    });
    expect(xml).toContain('<changefreq>weekly</changefreq>');
  });

  it('clamps priority > 1 to 1.0', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/', priority: 5 }],
    });
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('clamps priority < 0 to 0.0', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/', priority: -1 }],
    });
    expect(xml).toContain('<priority>0.0</priority>');
  });

  it('serialises a valid priority to one decimal place', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/', priority: 0.8 }],
    });
    expect(xml).toContain('<priority>0.8</priority>');
  });

  it('XML-escapes ampersands in paths', () => {
    const xml = generateSitemap({
      baseUrl: 'https://example.com',
      urls: [{ path: '/page?a=1&b=2' }],
    });
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('a=1&b');
  });
});

// ---------------------------------------------------------------------------
// generateRobotsTxt
// ---------------------------------------------------------------------------

describe('generateRobotsTxt', () => {
  it('includes User-agent: * by default', () => {
    const txt = generateRobotsTxt({ sitemapUrl: 'https://example.com/sitemap.xml' });
    expect(txt).toContain('User-agent: *');
  });

  it('includes the primary Sitemap URL', () => {
    const txt = generateRobotsTxt({ sitemapUrl: 'https://example.com/sitemap.xml' });
    expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
  });

  it('includes additional sitemaps', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      additionalSitemaps: ['https://example.com/image-sitemap.xml'],
    });
    expect(txt).toContain('Sitemap: https://example.com/image-sitemap.xml');
  });

  it('includes Disallow directives from options', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      directives: [{ userAgent: '*', disallow: ['/admin', '/private'] }],
    });
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('Disallow: /private');
  });

  it('includes Allow directives from options', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      directives: [{ userAgent: '*', allow: ['/'] }],
    });
    expect(txt).toContain('Allow: /');
  });

  it('includes Crawl-delay when specified', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      directives: [{ userAgent: 'Baiduspider', crawlDelay: 10 }],
    });
    expect(txt).toContain('Crawl-delay: 10');
  });

  it('adds noindex comment when noindex is true', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      noindex: true,
    });
    expect(txt).toContain('# X-Robots-Tag: noindex');
  });

  it('does not include noindex comment when noindex is false', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      noindex: false,
    });
    expect(txt).not.toContain('noindex');
  });

  it('supports multiple User-agent directive blocks', () => {
    const txt = generateRobotsTxt({
      sitemapUrl: 'https://example.com/sitemap.xml',
      directives: [
        { userAgent: '*', disallow: [] },
        { userAgent: 'AhrefsBot', disallow: ['/'] },
      ],
    });
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('User-agent: AhrefsBot');
    expect(txt).toContain('Disallow: /');
  });
});

// ---------------------------------------------------------------------------
// generateMetaTags
// ---------------------------------------------------------------------------

describe('generateMetaTags', () => {
  it('returns a Record object', () => {
    expect(generateMetaTags(SCHEMA)).toBeTypeOf('object');
  });

  it('includes a title derived from the schema', () => {
    const tags = generateMetaTags(SCHEMA);
    expect(tags['title']).toContain('Rusty Fork');
  });

  it('overrides title with pageTitle option', () => {
    const tags = generateMetaTags(SCHEMA, { pageTitle: 'Our Menu' });
    expect(tags['title']).toBe('Our Menu');
  });

  it('includes description from schema.seo', () => {
    const tags = generateMetaTags(SCHEMA);
    expect(tags['description']).toBe('Great American food in the heart of town.');
  });

  it('overrides description with pageDescription option', () => {
    const tags = generateMetaTags(SCHEMA, { pageDescription: 'Custom desc' });
    expect(tags['description']).toBe('Custom desc');
  });

  it('includes og:type as website', () => {
    expect(generateMetaTags(SCHEMA)['og:type']).toBe('website');
  });

  it('includes og:image from schema.seo.ogImageUrl', () => {
    expect(generateMetaTags(SCHEMA)['og:image']).toBe('https://cdn.example.com/og.jpg');
  });

  it('overrides og:image with ogImageUrl option', () => {
    const tags = generateMetaTags(SCHEMA, { ogImageUrl: 'https://cdn.example.com/custom.jpg' });
    expect(tags['og:image']).toBe('https://cdn.example.com/custom.jpg');
  });

  it('defaults twitter:card to summary_large_image', () => {
    expect(generateMetaTags(SCHEMA)['twitter:card']).toBe('summary_large_image');
  });

  it('respects twitterCard option', () => {
    const tags = generateMetaTags(SCHEMA, { twitterCard: 'summary' });
    expect(tags['twitter:card']).toBe('summary');
  });

  it('includes google-site-verification when set in schema', () => {
    expect(generateMetaTags(SCHEMA)['google-site-verification']).toBe('abc123');
  });

  it('includes msvalidate.01 when bing verification is set', () => {
    expect(generateMetaTags(SCHEMA)['msvalidate.01']).toBe('xyz456');
  });

  it('includes canonical URL when provided', () => {
    const tags = generateMetaTags(SCHEMA, { canonicalUrl: 'https://example.com/menu' });
    expect(tags['canonical']).toBe('https://example.com/menu');
    expect(tags['og:url']).toBe('https://example.com/menu');
  });

  it('omits empty-string keys', () => {
    const tags = generateMetaTags(SCHEMA);
    // canonical and og:url are only set when canonicalUrl is provided
    expect(tags).not.toHaveProperty('canonical');
  });
});

// ---------------------------------------------------------------------------
// generateSchemaOrg
// ---------------------------------------------------------------------------

describe('generateSchemaOrg', () => {
  it('returns an object with @context = https://schema.org', () => {
    const graph = generateSchemaOrg(SCHEMA);
    expect(graph['@context']).toBe('https://schema.org');
  });

  it('has a @graph array with at least one entity', () => {
    const { '@graph': graph } = generateSchemaOrg(SCHEMA);
    expect(Array.isArray(graph)).toBe(true);
    expect(graph.length).toBeGreaterThan(0);
  });

  it('maps businessType restaurant to @type Restaurant', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity['@type']).toBe('Restaurant');
  });

  it('maps businessType bar to @type BarOrPub', () => {
    const barSchema: ProjectSchema = { ...SCHEMA, id: 'bar-001', businessType: 'bar' };
    const [entity] = generateSchemaOrg(barSchema)['@graph'];
    expect(entity['@type']).toBe('BarOrPub');
  });

  it('maps businessType food-truck to @type FoodTruck', () => {
    const ftSchema: ProjectSchema = { ...SCHEMA, id: 'ft-001', businessType: 'food-truck' };
    const [entity] = generateSchemaOrg(ftSchema)['@graph'];
    expect(entity['@type']).toBe('FoodTruck');
  });

  it('includes the business name', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.name).toBe('The Rusty Fork');
  });

  it('includes telephone', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.telephone).toBe('555-0100');
  });

  it('includes email', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.email).toBe('hello@rustyfork.com');
  });

  it('includes servesCuisine', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.servesCuisine).toBe('American');
  });

  it('includes hasMap from googleMapsUrl', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.hasMap).toContain('maps.google.com');
  });

  it('includes a PostalAddress', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.address).toBeDefined();
    expect((entity.address as { '@type': string })['@type']).toBe('PostalAddress');
  });

  it('address contains city and state', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    const addr = entity.address as { addressLocality: string; addressRegion: string };
    expect(addr.addressLocality).toBe('Raleigh');
    expect(addr.addressRegion).toBe('NC');
  });

  it('includes openingHoursSpecification for open days', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(Array.isArray(entity.openingHoursSpecification)).toBe(true);
    // 6 open days (Mon–Sat), Sunday is closed
    expect((entity.openingHoursSpecification as unknown[]).length).toBe(6);
  });

  it('openingHoursSpecification entries have @type OpeningHoursSpecification', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    const specs = entity.openingHoursSpecification as Array<{ '@type': string }>;
    for (const spec of specs) {
      expect(spec['@type']).toBe('OpeningHoursSpecification');
    }
  });

  it('Sunday (day 0) is closed and not in openingHoursSpecification', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    const specs = entity.openingHoursSpecification as Array<{ dayOfWeek: string }>;
    const hasSunday = specs.some((s) => s.dayOfWeek === 'https://schema.org/Sunday');
    expect(hasSunday).toBe(false);
  });

  it('includes sameAs from non-empty social URLs', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(Array.isArray(entity.sameAs)).toBe(true);
    expect(entity.sameAs).toContain('https://instagram.com/rustyfork');
    expect(entity.sameAs).toContain('https://facebook.com/rustyfork');
  });

  it('does not include empty social strings in sameAs', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    // twitter and tiktok are empty strings in SCHEMA
    const sameAs = entity.sameAs as string[];
    expect(sameAs.some((s) => s === '')).toBe(false);
  });

  it('uses subdomain to construct url when no customDomain', () => {
    const [entity] = generateSchemaOrg(SCHEMA)['@graph'];
    expect(entity.url).toBe('https://rustyfork.plated.app');
  });

  it('prefers customDomain over subdomain for url', () => {
    const customSchema: ProjectSchema = {
      ...SCHEMA,
      id: 'custom-001',
      deployment: { subdomain: 'rustyfork', customDomain: 'rustyfork.com' },
    };
    const [entity] = generateSchemaOrg(customSchema)['@graph'];
    expect(entity.url).toBe('https://rustyfork.com');
  });

  it('has no url when deployment is empty', () => {
    const noDeploySchema: ProjectSchema = {
      ...SCHEMA,
      id: 'nodeploy-001',
      deployment: { subdomain: '', customDomain: '' },
    };
    const [entity] = generateSchemaOrg(noDeploySchema)['@graph'];
    expect(entity.url).toBeUndefined();
  });
});
