import { describe, it, expect } from 'vitest';
import {
  THEME_REGISTRY,
  THEME_IDS,
  getTheme,
  isValidTheme,
} from '../themeRegistry.js';

describe('THEME_IDS', () => {
  it('contains exactly 6 entries', () => {
    expect(THEME_IDS).toHaveLength(6);
  });

  it('starts with hearth', () => {
    expect(THEME_IDS[0]).toBe('hearth');
  });

  it('ends with ember', () => {
    expect(THEME_IDS[THEME_IDS.length - 1]).toBe('ember');
  });

  it('contains no duplicates', () => {
    expect(new Set(THEME_IDS).size).toBe(THEME_IDS.length);
  });

  it('every ID is a key in THEME_REGISTRY', () => {
    for (const id of THEME_IDS) {
      expect(THEME_REGISTRY).toHaveProperty(id);
    }
  });
});

describe('getTheme', () => {
  it('returns the correct entry for a valid id', () => {
    const entry = getTheme('hearth');
    expect(entry).toBeDefined();
    expect(entry?.id).toBe('hearth');
  });

  it('returns undefined for an unknown id', () => {
    expect(getTheme('nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getTheme('')).toBeUndefined();
  });

  it('every known theme has a displayName, description, and displayFont', () => {
    for (const id of THEME_IDS) {
      const entry = getTheme(id)!;
      expect(typeof entry.displayName).toBe('string');
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
      expect(typeof entry.displayFont).toBe('string');
      expect(entry.displayFont.length).toBeGreaterThan(0);
    }
  });

  it('every theme has swatches for default, warm, and cool', () => {
    for (const id of THEME_IDS) {
      const { swatches } = getTheme(id)!;
      for (const variant of ['default', 'warm', 'cool'] as const) {
        expect(swatches[variant]).toBeDefined();
        expect(swatches[variant].accent).toMatch(/^#[0-9a-f]{6}$/i);
        expect(swatches[variant].bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(swatches[variant].text).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('every theme has a non-empty bestFor array', () => {
    for (const id of THEME_IDS) {
      const { bestFor } = getTheme(id)!;
      expect(Array.isArray(bestFor)).toBe(true);
      expect(bestFor.length).toBeGreaterThan(0);
    }
  });

  it('mode is either light or dark for all themes', () => {
    for (const id of THEME_IDS) {
      expect(['light', 'dark']).toContain(getTheme(id)!.mode);
    }
  });

  it('midnight is a dark theme', () => {
    expect(getTheme('midnight')?.mode).toBe('dark');
  });

  it('ember is a dark theme', () => {
    expect(getTheme('ember')?.mode).toBe('dark');
  });

  it('hearth is a light theme', () => {
    expect(getTheme('hearth')?.mode).toBe('light');
  });
});

describe('isValidTheme', () => {
  it('returns true for every known ThemeId', () => {
    for (const id of THEME_IDS) {
      expect(isValidTheme(id)).toBe(true);
    }
  });

  it('returns false for an unknown string', () => {
    expect(isValidTheme('neon')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidTheme('')).toBe(false);
  });

  it('returns false for a theme casing variant', () => {
    expect(isValidTheme('Hearth')).toBe(false);
  });
});
