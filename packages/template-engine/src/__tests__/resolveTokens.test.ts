import { describe, it, expect } from 'vitest';
import { resolveTokens } from '../resolveTokens.js';
import type { ProjectSchema } from '@plated/types';

function makeSchema(overrides: Partial<ProjectSchema> = {}): ProjectSchema {
  return {
    id: 'test-id',
    schemaVersion: '2.0',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    businessType: 'restaurant',
    styleTemplate: 'hearth',
    colorTheme: 'light',
    darkMode: false,
    business: {
      name: 'Hearth & Vine',
      tagline: 'Wood-fired food.',
      description: 'A warm place.',
      cuisineType: 'American',
      phone: '555-0100',
      email: 'hi@example.com',
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
      siteTitle: 'Hearth & Vine',
      metaDescription: 'A warm place.',
      ogImageUrl: '',
    },
    social: {
      instagram: 'https://instagram.com/hearthandvine',
      facebook: '',
    },
    integrations: {},
    locations: [
      {
        id: 'loc-1',
        name: 'Downtown',
        address1: '123 Main St',
        city: 'Charleston',
        state: 'SC',
        zip: '29401',
        country: 'US',
        hours: { schedule: [] },
      },
    ],
    primaryLocationIndex: 0,
    menu: { categories: [] },
    extensions: {},
    deployment: {},
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
