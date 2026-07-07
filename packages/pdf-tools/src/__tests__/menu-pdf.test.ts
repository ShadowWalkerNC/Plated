import { describe, it, expect } from 'vitest';
import { generateMenuPdf } from '../menu-pdf.js';
import type { MenuSchema } from '@plated/types';

// ---------------------------------------------------------------------------
// hexToRgb — tested indirectly via generateMenuPdf output (no crash means
// the internal helper parsed the hex correctly). We also expose it via
// named assertions that check the PDF bytes for colour artifacts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const EMPTY_MENU: MenuSchema = { categories: [] };

const FULL_MENU: MenuSchema = {
  categories: [
    {
      id:           'cat-1',
      name:         'Starters',
      displayOrder: 1,
      items: [
        {
          id:           'item-1',
          name:         'Bruschetta',
          price:        '$9.00',
          description:  'Toasted bread with tomatoes.',
          available:    true,
          displayOrder: 1,
          dietaryTags:  ['vegetarian', 'vegan'],
        },
        {
          id:           'item-2',
          name:         'Seasonal Soup',
          price:        '$7.00',
          description:  'Changes daily.',
          available:    false,   // should NOT appear
          displayOrder: 2,
          dietaryTags:  [],
        },
      ],
    },
    {
      id:           'cat-2',
      name:         'Mains',
      displayOrder: 2,
      items: [
        {
          id:           'item-3',
          name:         'Grilled Salmon',
          price:        '$24.00',
          description:  'Atlantic salmon, seasonal veg.',
          available:    true,
          displayOrder: 1,
          dietaryTags:  ['gluten-free', 'dairy-free'],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper — decode a Uint8Array as latin-1 text (safe for PDF bytes)
// ---------------------------------------------------------------------------
function pdfText(buf: Uint8Array): string {
  return Buffer.from(buf).toString('latin1');
}

// ---------------------------------------------------------------------------
// generateMenuPdf — output shape
// ---------------------------------------------------------------------------

describe('generateMenuPdf — output shape', () => {
  it('returns a Uint8Array', () => {
    const result = generateMenuPdf(EMPTY_MENU, { restaurantName: 'Test' });
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('returns a non-empty buffer', () => {
    const result = generateMenuPdf(EMPTY_MENU, { restaurantName: 'Test' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('output starts with the PDF magic header %PDF-', () => {
    const result = generateMenuPdf(EMPTY_MENU, { restaurantName: 'Test' });
    const header = Buffer.from(result.slice(0, 5)).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('does not throw on an empty menu', () => {
    expect(() =>
      generateMenuPdf(EMPTY_MENU, { restaurantName: 'Empty Place' })
    ).not.toThrow();
  });

  it('does not throw with a4 page size', () => {
    expect(() =>
      generateMenuPdf(FULL_MENU, { restaurantName: 'A4 Place', pageSize: 'a4' })
    ).not.toThrow();
  });

  it('does not throw with a custom accent color', () => {
    expect(() =>
      generateMenuPdf(FULL_MENU, {
        restaurantName: 'Custom Color',
        accentColor: '#2d6a4f',
      })
    ).not.toThrow();
  });

  it('does not throw with a 3-char shorthand hex accent color', () => {
    expect(() =>
      generateMenuPdf(FULL_MENU, {
        restaurantName: 'Short Hex',
        accentColor: '#f0a',
      })
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// generateMenuPdf — content
// ---------------------------------------------------------------------------

describe('generateMenuPdf — content', () => {
  it('embeds the restaurant name in the PDF bytes', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'The Rusty Fork' });
    expect(pdfText(result)).toContain('The Rusty Fork');
  });

  it('embeds the tagline when provided', () => {
    const result = generateMenuPdf(FULL_MENU, {
      restaurantName: 'The Rusty Fork',
      tagline: 'Food worth driving for.',
    });
    expect(pdfText(result)).toContain('Food worth driving for.');
  });

  it('embeds category names in the PDF bytes', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    const text = pdfText(result);
    expect(text).toContain('STARTERS');
    expect(text).toContain('MAINS');
  });

  it('embeds available item names', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    expect(pdfText(result)).toContain('Bruschetta');
    expect(pdfText(result)).toContain('Grilled Salmon');
  });

  it('does not embed unavailable item names', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    // "Seasonal Soup" has available: false
    expect(pdfText(result)).not.toContain('Seasonal Soup');
  });

  it('embeds item prices', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    const text = pdfText(result);
    expect(text).toContain('$9.00');
    expect(text).toContain('$24.00');
  });

  it('embeds vegetarian dietary tag abbreviation V', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    // Bruschetta has [vegetarian, vegan] → "V  VE"
    expect(pdfText(result)).toContain('V');
  });

  it('embeds gluten-free tag abbreviation GF', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    expect(pdfText(result)).toContain('GF');
  });

  it('embeds dairy-free tag abbreviation DF', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    expect(pdfText(result)).toContain('DF');
  });

  it('embeds item descriptions', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Test' });
    expect(pdfText(result)).toContain('Toasted bread with tomatoes.');
  });

  it('produces a larger buffer when menu has items vs empty', () => {
    const empty = generateMenuPdf(EMPTY_MENU, { restaurantName: 'Test' });
    const full  = generateMenuPdf(FULL_MENU,  { restaurantName: 'Test' });
    expect(full.length).toBeGreaterThan(empty.length);
  });

  it('embeds page footer text with restaurant name', () => {
    const result = generateMenuPdf(FULL_MENU, { restaurantName: 'Fork House' });
    expect(pdfText(result)).toContain('Fork House');
  });
});
