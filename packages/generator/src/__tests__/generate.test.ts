import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '../index.js';
import type { ProjectSchema } from '@plated/types';

const FULL_SCHEMA: ProjectSchema = {
  id: 'test-smoke-001',
  schemaVersion: '2.0',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  styleTemplate: 'hearth',
  colorTheme: 'default',
  darkMode: false,
  business: {
    name: 'Generator Smoke Test',
    tagline: 'Testing is good.',
    description: 'A full smoke test of the generator.',
    cuisineType: 'Test Cuisine',
    phone: '555-9999',
    email: 'smoke@test.com',
    foundedYear: 2017,
    existingWebsite: '',
  },
  branding: {
    primaryColor: '#8a4b2f',
    secondaryColor: '#f4ede4',
    accentColor: '#c98f4a',
    logoUrl: '',
    heroImageUrl: '',
    faviconSourceUrl: '',
  },
  seo: {
    siteTitle: 'Generator Smoke Test',
    metaDescription: 'A full smoke test.',
    ogImageUrl: '',
  },
  social: {
    instagram: 'https://instagram.com/test',
  },
  integrations: {},
  locations: [
    {
      id: 'loc-main',
      name: 'Main',
      address1: '42 Test Blvd',
      address2: '',
      city: 'Testopolis',
      state: 'NC',
      zip: '27601',
      country: 'US',
      phone: '555-9999',
      email: '',
      googleMapsUrl: '',
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
  menu: {
    categories: [
      {
        id: 'starters',
        name: 'Starters',
        description: 'To begin.',
        displayOrder: 0,
        items: [
          { id: 'bruschetta', name: 'Bruschetta', description: 'Toasted bread.', price: '$9',  dietaryTags: ['vegan'], available: true, displayOrder: 0 },
          { id: 'soup',      name: 'Soup',       description: 'Daily soup.',    price: '$7',  dietaryTags: [],        available: true, displayOrder: 1 },
        ],
      },
      {
        id: 'mains',
        name: 'Mains',
        description: 'Hearty plates.',
        displayOrder: 1,
        items: [
          { id: 'steak', name: 'Steak', description: 'Wood-fired.', price: '$42', dietaryTags: [], available: true, displayOrder: 0 },
        ],
      },
    ],
  },
  extensions: {
    analytics: {
      plausible: { enabled: true },
      ga4:      { enabled: false },
    },
    reservations: {
      provider: 'opentable',
    },
  },
  deployment: {},
};

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'plated-test-'));
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
