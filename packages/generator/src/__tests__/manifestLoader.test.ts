import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('loadManifests (idempotency)', () => {
  beforeEach(() => {
    // Reset the module registry so _loaded is reset between tests
    vi.resetModules();
  });

  it('runs without throwing', async () => {
    const { loadManifests } = await import('../manifestLoader.js');
    expect(() => loadManifests()).not.toThrow();
  });

  it('is idempotent — calling twice does not throw', async () => {
    const { loadManifests } = await import('../manifestLoader.js');
    expect(() => {
      loadManifests();
      loadManifests();
    }).not.toThrow();
  });

  it('registers manifests that make generate() succeed', async () => {
    const { loadManifests } = await import('../manifestLoader.js');
    const { generate }      = await import('../index.js');
    loadManifests();

    const result = await generate(
      {
        id: 'manifest-loader-test',
        schemaVersion: '2.0',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        businessType: 'cafe',
        styleTemplate: 'canvas',
        colorTheme: 'default',
        darkMode: false,
        business: { name: 'Manifest Test Cafe', description: '' },
        branding: {},
        seo: {},
        social: {},
        integrations: {},
        locations: [],
        primaryLocationIndex: 0,
        menu: { categories: [] },
        extensions: {},
        deployment: {},
      },
      '/dev/null',
      { dryRun: true },
    );

    expect(result.success).toBe(true);
    expect(result.filesWritten).toBeGreaterThan(0);
  });
});
