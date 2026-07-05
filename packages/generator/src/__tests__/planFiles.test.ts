import { describe, it, expect } from 'vitest';
import { planFiles } from '../planFiles.js';
import type { ProjectSchema } from '@nexcms/types';

const SCHEMA: ProjectSchema = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  business: {
    name: 'Plan Test',
    tagline: '',
    description: '',
    cuisineType: '',
    phone: '',
    email: '',
    foundedYear: '',
    existingWebsiteUrl: '',
  },
  branding: {
    primaryColor: '#000',
    secondaryColor: '#fff',
    accentColor: '#888',
    logoUrl: '',
    heroImageUrl: '',
    faviconUrl: '',
  },
  seo: { siteTitle: 'Plan Test', metaDescription: '', ogImageUrl: '' },
  social: {
    instagram: '', facebook: '', twitter: '', googleBusiness: '',
    yelp: '', tripadvisor: '', doordash: '', ubereats: '', grubhub: '', toast: '', chownow: '',
  },
  locations: [],
  primaryLocationIndex: 0,
  menu: {
    categories: [
      { id: 'c1', name: 'Starters', description: '', items: [
        { id: 'i1', name: 'Bruschetta', description: '', price: '$9', dietaryTags: ['vegan'] },
      ]},
    ],
  },
  extensions: {},
};

describe('planFiles', () => {
  it('returns an array', () => {
    expect(Array.isArray(planFiles(SCHEMA))).toBe(true);
  });

  it('includes an index route', () => {
    const plan = planFiles(SCHEMA);
    const paths = plan.map((f) => f.outputPath);
    expect(paths.some((p) => p === 'src/pages/index.astro' || p.endsWith('index.astro'))).toBe(true);
  });

  it('includes a menu route', () => {
    const plan = planFiles(SCHEMA);
    const paths = plan.map((f) => f.outputPath);
    expect(paths.some((p) => p.includes('menu'))).toBe(true);
  });

  it('includes a site config file', () => {
    const plan = planFiles(SCHEMA);
    const paths = plan.map((f) => f.outputPath);
    expect(paths.some((p) => p.includes('config') || p.includes('site'))).toBe(true);
  });

  it('returns unique output paths', () => {
    const plan = planFiles(SCHEMA);
    const paths = plan.map((f) => f.outputPath);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it('every entry has a non-empty outputPath', () => {
    const plan = planFiles(SCHEMA);
    for (const entry of plan) {
      expect(entry.outputPath.length).toBeGreaterThan(0);
    }
  });
});
