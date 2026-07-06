import { describe, it, expect } from 'vitest';
import { generate } from '../index.js';
import type { ProjectSchema } from '@plated/types';

// Minimal valid v2 schema — tests that generate() plans the right file set
const SCHEMA: ProjectSchema = {
  id: 'test-plan-001',
  schemaVersion: '2.0',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  styleTemplate: 'hearth',
  colorTheme: 'default',
  darkMode: false,
  business: {
    name: 'Plan Test',
    description: '',
  },
  branding: {},
  seo: {},
  social: {},
  integrations: {},
  locations: [],
  primaryLocationIndex: 0,
  menu: {
    categories: [
      {
        id: 'c1',
        name: 'Starters',
        description: '',
        displayOrder: 0,
        items: [
          { id: 'i1', name: 'Bruschetta', description: '', price: '$9', dietaryTags: ['vegan'], available: true, displayOrder: 0 },
        ],
      },
    ],
  },
  extensions: {},
  deployment: {},
};

describe('generate file plan (dry run)', () => {
  it('filesWritten is a positive number', async () => {
    const result = await generate(SCHEMA, '/dev/null', { dryRun: true });
    expect(result.filesWritten).toBeGreaterThan(0);
  });

  it('success is true', async () => {
    const result = await generate(SCHEMA, '/dev/null', { dryRun: true });
    expect(result.success).toBe(true);
  });

  it('errors array is empty', async () => {
    const result = await generate(SCHEMA, '/dev/null', { dryRun: true });
    expect(result.errors).toHaveLength(0);
  });

  it('generates at least 10 files for a minimal schema', async () => {
    const result = await generate(SCHEMA, '/dev/null', { dryRun: true });
    // base set: package.json, astro.config, tsconfig, env.d.ts,
    // global.css, theme.css, Base layout, Nav, Footer, Hero,
    // MenuSection, HoursSection, LocationSection, SocialLinks,
    // Gallery, index.astro, menu.astro, contact.astro,
    // robots.txt, manifest.json, plated-site.json, README.md
    expect(result.filesWritten).toBeGreaterThanOrEqual(10);
  });

  it('generates more files when description is set (adds about page)', async () => {
    const withAbout: ProjectSchema = {
      ...SCHEMA,
      id: 'test-plan-002',
      business: { ...SCHEMA.business, description: 'A great place to eat.' },
    };
    const base  = await generate(SCHEMA,     '/dev/null', { dryRun: true });
    const extra = await generate(withAbout,  '/dev/null', { dryRun: true });
    expect(extra.filesWritten).toBeGreaterThan(base.filesWritten);
  });
});
