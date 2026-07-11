/**
 * themeRegistry.ts — single source of truth for all Plated visual themes.
 *
 * Consumers:
 *   - astro-output/styles/theme.ts  (reads variables.css from disk)
 *   - builder/Step7Template.tsx     (populates style picker)
 *   - generator/index.ts            (validates schema.styleTemplate)
 *   - CLI, docs, and tests
 *
 * Rule: NEVER import from @plated/types here — this file is the
 * canonical definition that @plated/types re-exports.
 */
import { join, resolve } from 'node:path';
import { existsSync }   from 'node:fs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeId = 'hearth' | 'canvas' | 'midnight' | 'market' | 'coast' | 'ember';
export type ThemeVariant = 'default' | 'warm' | 'cool';

/** Hex swatch colours shown in the style picker for each variant. */
export interface ThemeSwatches {
  /** The main accent colour for this variant. */
  accent: string;
  /** The base background colour for this variant. */
  bg: string;
  /** The primary text colour for this variant. */
  text: string;
}

export interface ThemeEntry {
  id: ThemeId;
  displayName: string;
  description: string;
  /** CSS display font family (first in the stack). */
  displayFont: string;
  /** Short personality tag shown in the UI. */
  personality: string;
  /** Whether this theme is primarily light or dark. */
  mode: 'light' | 'dark';
  /** Best-fit business types, ordered by relevance. */
  bestFor: string[];
  /** Swatch colours per variant — used by the style picker preview chips. */
  swatches: Record<ThemeVariant, ThemeSwatches>;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const THEME_REGISTRY: Readonly<Record<ThemeId, ThemeEntry>> = {
  hearth: {
    id:          'hearth',
    displayName: 'Hearth',
    description: 'Warm, rustic, and editorial — soft amber backgrounds with serif display type.',
    displayFont: 'Georgia',
    personality: 'Warm & editorial',
    mode:        'light',
    bestFor:     ['restaurant', 'catering', 'bar', 'cafe'],
    swatches: {
      default: { accent: '#c8622a', bg: '#faf7f2', text: '#1c1108' },
      warm:    { accent: '#8b2200', bg: '#f7f0e8', text: '#180c04' },
      cool:    { accent: '#3a6e2c', bg: '#f4f7f2', text: '#0c180a' },
    },
  },

  canvas: {
    id:          'canvas',
    displayName: 'Canvas',
    description: 'Clean, minimal, system-font — a neutral base that lets your content lead.',
    displayFont: 'Inter',
    personality: 'Modern & minimal',
    mode:        'light',
    bestFor:     ['ghost-kitchen', 'cafe', 'food-stand', 'catering'],
    swatches: {
      default: { accent: '#2563eb', bg: '#f8f9fb', text: '#0d1117' },
      warm:    { accent: '#d97706', bg: '#fdfaf6', text: '#1a1008' },
      cool:    { accent: '#0d9488', bg: '#f4fafa', text: '#041414' },
    },
  },

  midnight: {
    id:          'midnight',
    displayName: 'Midnight',
    description: 'Dark, premium, and moody — deep backgrounds with gold or silver accents.',
    displayFont: 'Cormorant Garamond',
    personality: 'Dark & premium',
    mode:        'dark',
    bestFor:     ['bar', 'restaurant', 'catering'],
    swatches: {
      default: { accent: '#c8a84a', bg: '#0e0c0a', text: '#f0e8d8' },
      warm:    { accent: '#b86a2a', bg: '#100a08', text: '#f2e4d4' },
      cool:    { accent: '#8ab0d4', bg: '#0a0c10', text: '#dce8f4' },
    },
  },

  market: {
    id:          'market',
    displayName: 'Market',
    description: 'Fresh, casual, and ingredient-forward — botanical greens and natural earthy tones.',
    displayFont: 'Playfair Display',
    personality: 'Fresh & botanical',
    mode:        'light',
    bestFor:     ['cafe', 'bakery', 'food-truck', 'food-stand'],
    swatches: {
      default: { accent: '#3a7a2c', bg: '#f7f9f4', text: '#101e0c' },
      warm:    { accent: '#c88a10', bg: '#fdf9ef', text: '#1e1408' },
      cool:    { accent: '#7c3aac', bg: '#faf7fc', text: '#140c1e' },
    },
  },

  coast: {
    id:          'coast',
    displayName: 'Coast',
    description: 'Airy, bright, and hospitality-forward — whites and sky blues with a welcoming warmth.',
    displayFont: 'Lora',
    personality: 'Airy & bright',
    mode:        'light',
    bestFor:     ['restaurant', 'bar', 'cafe', 'catering'],
    swatches: {
      default: { accent: '#1a6ea8', bg: '#f6fbff', text: '#081828' },
      warm:    { accent: '#d04a28', bg: '#fff8f5', text: '#28100a' },
      cool:    { accent: '#1a8c60', bg: '#f4fdf9', text: '#061812' },
    },
  },

  ember: {
    id:          'ember',
    displayName: 'Ember',
    description: 'Bold, dramatic, fire-lit — near-black backgrounds with fire-orange or crimson accents.',
    displayFont: 'Oswald',
    personality: 'Bold & dramatic',
    mode:        'dark',
    bestFor:     ['food-truck', 'food-stand', 'bar', 'restaurant'],
    swatches: {
      default: { accent: '#e8581a', bg: '#141210', text: '#f4ece0' },
      warm:    { accent: '#c0200a', bg: '#120c0a', text: '#f4e4d8' },
      cool:    { accent: '#d4b800', bg: '#101210', text: '#f0f0d8' },
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ordered list of all theme IDs — use this for iteration, not Object.keys(). */
export const THEME_IDS: readonly ThemeId[] = [
  'hearth', 'canvas', 'midnight', 'market', 'coast', 'ember',
] as const;

/** Returns the ThemeEntry for a given ID, or undefined if the ID is unknown. */
export function getTheme(id: string): ThemeEntry | undefined {
  return THEME_REGISTRY[id as ThemeId];
}

/** Type-guard — returns true when id is a valid ThemeId. */
export function isValidTheme(id: string): id is ThemeId {
  return id in THEME_REGISTRY;
}

/**
 * resolveStyleFile — returns the absolute path to a theme's variables.css.
 *
 * Resolution order:
 *   1. PLATED_STYLES_DIR env var (set by the Electron main process in production)
 *   2. Repo-relative path from this file's location (works in dev and CI)
 *
 * @param themeId   One of the 6 ThemeId values.
 * @param _variant  Currently unused — all variants live in the same file.
 *                  Parameter reserved for future per-variant overrides.
 */
export function resolveStyleFile(themeId: ThemeId, _variant?: ThemeVariant): string {
  const filename = 'variables.css';

  // 1. Explicit env override (Electron production build sets this)
  const envDir = process.env['PLATED_STYLES_DIR'];
  if (envDir) {
    const candidate = join(envDir, themeId, filename);
    if (existsSync(candidate)) return candidate;
  }

  // 2. Repo-relative: packages/generator/src/ -> ../../../styles/<id>/
  const repoRelative = resolve(
    __dirname,
    '../../../styles',
    themeId,
    filename,
  );
  return repoRelative;
}
