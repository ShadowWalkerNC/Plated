import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../renderTemplate.js';
import type { ProjectSchema } from '@plated/types';

const BASE_SCHEMA: ProjectSchema = {
  id: 'test-id',
  schemaVersion: '2.0',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  businessType: 'restaurant',
  styleTemplate: 'hearth',
  colorTheme: 'light',
  darkMode: false,
  business: {
    name: 'The Test Kitchen',
    tagline: 'Freshly tested.',
    description: 'A test restaurant.',
    cuisineType: 'Fusion',
    phone: '555-0000',
    email: 'test@example.com',
  },
  branding: {
    primaryColor: '#111',
    secondaryColor: '#eee',
    accentColor: '#999',
    logoUrl: '',
    heroImageUrl: '',
    faviconSourceUrl: '',
  },
  seo: {
    siteTitle: 'The Test Kitchen',
    metaDescription: 'A test restaurant.',
    ogImageUrl: '',
  },
  social: {},
  integrations: {},
  locations: [
    {
      id: 'loc-1',
      name: '',
      address1: '1 Test Ave',
      city: 'Testville',
      state: 'TX',
      zip: '00000',
      country: 'US',
      hours: { schedule: [] },
    },
  ],
  primaryLocationIndex: 0,
  menu: { categories: [] },
  extensions: {},
  deployment: {},
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
