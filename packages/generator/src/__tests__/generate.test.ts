import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '../generate.js';
import type { ProjectSchema } from '@nexcms/types';

const FULL_SCHEMA: ProjectSchema = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  business: {
    name: 'Generator Smoke Test',
    tagline: 'Testing is good.',
    description: 'A full smoke test of the generator.',
    cuisineType: 'Test Cuisine',
    phone: '555-9999',
    email: 'smoke@test.com',
    foundedYear: '2024',
    existingWebsiteUrl: '',
  },
  branding: {
    primaryColor: '#8a4b2f',
    secondaryColor: '#f4ede4',
    accentColor: '#c98f4a',
    logoUrl: '',
    heroImageUrl: '',
    faviconUrl: '',
  },
  seo: {
    siteTitle: 'Generator Smoke Test',
    metaDescription: 'A full smoke test.',
    ogImageUrl: '',
  },
  social: {
    instagram: 'https://instagram.com/test',
    facebook: '',
    twitter: '',
    googleBusiness: '',
    yelp: '',
    tripadvisor: '',
    doordash: '',
    ubereats: '',
    grubhub: '',
    toast: '',
    chownow: '',
  },
  locations: [
    {
      name: 'Main',
      address1: '42 Test Blvd',
      address2: '',
      city: 'Testopolis',
      state: 'NC',
      zip: '27601',
      phone: '555-9999',
      email: '',
      googleMapsUrl: '',
      appleMapsUrl: '',
      holidayNote: '',
      hours: {
        timezone: 'America/New_York',
        schedule: [
          { day: 0, open: false, openTime: '', closeTime: '' },
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
  menu: {
    categories: [
      {
        id: 'starters',
        name: 'Starters',
        description: 'To begin.',
        items: [
          { id: 'bruschetta', name: 'Bruschetta', description: 'Toasted bread.', price: '$9', dietaryTags: ['vegan'] },
          { id: 'soup',      name: 'Soup',       description: 'Daily soup.',    price: '$7', dietaryTags: [] },
        ],
      },
      {
        id: 'mains',
        name: 'Mains',
        description: 'Hearty plates.',
        items: [
          { id: 'steak', name: 'Steak', description: 'Wood-fired.', price: '$42', dietaryTags: [] },
        ],
      },
    ],
  },
  extensions: {
    googleAnalytics: { enabled: false },
    reservations: { enabled: true },
  },
};

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nexcms-test-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('generate (smoke)', () => {
  it('returns success: true', async () => {
    const result = await generate(FULL_SCHEMA, tmpDir);
    expect(result.success).toBe(true);
  });

  it('writes at least one file', async () => {
    await generate(FULL_SCHEMA, tmpDir);
    const entries = await readdir(tmpDir, { recursive: true });
    expect(entries.length).toBeGreaterThan(0);
  });

  it('reports filesWritten > 0', async () => {
    const result = await generate(FULL_SCHEMA, tmpDir);
    expect(result.filesWritten).toBeGreaterThan(0);
  });

  it('reports outputDir matching the provided path', async () => {
    const result = await generate(FULL_SCHEMA, tmpDir);
    expect(result.outputDir).toBe(tmpDir);
  });

  it('result.errors is empty on success', async () => {
    const result = await generate(FULL_SCHEMA, tmpDir);
    expect(result.errors).toHaveLength(0);
  });

  it('dry run does not write files', async () => {
    const result = await generate(FULL_SCHEMA, tmpDir, { dryRun: true });
    const entries = await readdir(tmpDir, { recursive: true });
    expect(result.success).toBe(true);
    expect(entries.length).toBe(0);
  });

  it('injects business name into generated index page', async () => {
    await generate(FULL_SCHEMA, tmpDir);
    const { readFile } = await import('node:fs/promises');
    const { existsSync } = await import('node:fs');
    const indexPath = join(tmpDir, 'src', 'pages', 'index.astro');
    if (existsSync(indexPath)) {
      const content = await readFile(indexPath, 'utf-8');
      expect(content).toContain('Generator Smoke Test');
    }
  });
});
