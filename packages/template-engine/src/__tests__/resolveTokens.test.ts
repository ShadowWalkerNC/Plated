import { describe, it, expect } from 'vitest';
import { resolveTokens } from '../resolveTokens.js';
import type { ProjectSchema } from '@nexcms/types';

function makeSchema(overrides: Partial<ProjectSchema> = {}): ProjectSchema {
  return {
    schemaVersion: '1.0.0',
    generatedAt: '2026-01-01T00:00:00Z',
    businessType: 'restaurant',
    business: {
      name: 'Hearth & Vine',
      tagline: 'Wood-fired food.',
      description: 'A warm place.',
      cuisineType: 'American',
      phone: '555-0100',
      email: 'hi@example.com',
      foundedYear: '2019',
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
      siteTitle: 'Hearth & Vine',
      metaDescription: 'A warm place.',
      ogImageUrl: '',
    },
    social: {
      instagram: 'https://instagram.com/hearthandvine',
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
        name: 'Downtown',
        address1: '123 Main St',
        address2: '',
        city: 'Charleston',
        state: 'SC',
        zip: '29401',
        phone: '555-0100',
        email: '',
        googleMapsUrl: '',
        appleMapsUrl: '',
        holidayNote: '',
        hours: {
          timezone: 'America/New_York',
          schedule: [],
        },
      },
    ],
    primaryLocationIndex: 0,
    menu: { categories: [] },
    extensions: {},
    ...overrides,
  };
}

describe('resolveTokens', () => {
  it('exposes business.name', () => {
    const tokens = resolveTokens(makeSchema());
    expect(tokens['business.name']).toBe('Hearth & Vine');
  });

  it('exposes branding.primaryColor', () => {
    const tokens = resolveTokens(makeSchema());
    expect(tokens['branding.primaryColor']).toBe('#8a4b2f');
  });

  it('exposes seo.siteTitle', () => {
    const tokens = resolveTokens(makeSchema());
    expect(tokens['seo.siteTitle']).toBe('Hearth & Vine');
  });

  it('exposes primary location city', () => {
    const tokens = resolveTokens(makeSchema());
    expect(tokens['location.city']).toBe('Charleston');
  });

  it('exposes full location address', () => {
    const tokens = resolveTokens(makeSchema());
    expect(tokens['location.address1']).toBe('123 Main St');
  });

  it('returns a flat string map', () => {
    const tokens = resolveTokens(makeSchema());
    for (const value of Object.values(tokens)) {
      expect(typeof value).toBe('string');
    }
  });
});
