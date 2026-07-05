import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../renderTemplate.js';
import type { ProjectSchema } from '@nexcms/types';

const BASE_SCHEMA: ProjectSchema = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  business: {
    name: 'The Test Kitchen',
    tagline: 'Freshly tested.',
    description: 'A test restaurant.',
    cuisineType: 'Fusion',
    phone: '555-0000',
    email: 'test@example.com',
    foundedYear: '2020',
    existingWebsiteUrl: '',
  },
  branding: {
    primaryColor: '#111',
    secondaryColor: '#eee',
    accentColor: '#999',
    logoUrl: '',
    heroImageUrl: '',
    faviconUrl: '',
  },
  seo: {
    siteTitle: 'The Test Kitchen',
    metaDescription: 'A test restaurant.',
    ogImageUrl: '',
  },
  social: {
    instagram: '', facebook: '', twitter: '', googleBusiness: '',
    yelp: '', tripadvisor: '', doordash: '', ubereats: '', grubhub: '', toast: '', chownow: '',
  },
  locations: [
    {
      name: '',
      address1: '1 Test Ave',
      address2: '',
      city: 'Testville',
      state: 'TX',
      zip: '00000',
      phone: '',
      email: '',
      googleMapsUrl: '',
      appleMapsUrl: '',
      holidayNote: '',
      hours: { timezone: 'UTC', schedule: [] },
    },
  ],
  primaryLocationIndex: 0,
  menu: { categories: [] },
  extensions: {},
};

describe('renderTemplate', () => {
  it('injects business name into a template string', () => {
    const result = renderTemplate('<title>{{business.name}}</title>', BASE_SCHEMA);
    expect(result).toContain('The Test Kitchen');
  });

  it('injects primary color', () => {
    const result = renderTemplate('color: {{branding.primaryColor}}', BASE_SCHEMA);
    expect(result).toContain('#111');
  });

  it('injects location city', () => {
    const result = renderTemplate('{{location.city}}', BASE_SCHEMA);
    expect(result).toBe('Testville');
  });

  it('handles template with no tokens unchanged', () => {
    const result = renderTemplate('no tokens here', BASE_SCHEMA);
    expect(result).toBe('no tokens here');
  });

  it('handles multiple tokens in one pass', () => {
    const result = renderTemplate('{{business.name}} — {{business.tagline}}', BASE_SCHEMA);
    expect(result).toBe('The Test Kitchen — Freshly tested.');
  });
});
