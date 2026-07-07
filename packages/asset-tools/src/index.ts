/**
 * @plated/asset-tools
 *
 * Image and asset processing for the Plated generator pipeline.
 * All processing runs in Node.js 22. No Python. No headless browser. (D2)
 *
 * Type definitions live here and are imported by the implementation
 * modules — single source of truth, no duplication.
 *
 * Exports:
 *   generateFavicons     — source image → FaviconSet (ICO, Apple, Android)
 *   optimizeImage        — input → WebP + blur placeholder data URL
 *   generateOgImage      — businessName + colors → 1200×630 OG PNG
 *   extractPrimaryColor  — image → dominant hex color string
 */

// ---- Canonical type definitions ---------------------------------------------

export interface FaviconSet {
  /** favicon.ico (16×16 + 32×32 multi-size ICO, spec-compliant) */
  ico:            Buffer;
  /** apple-touch-icon.png (180×180) */
  appleTouchIcon: Buffer;
  /** android-chrome-192×192.png */
  android192:     Buffer;
  /** android-chrome-512×512.png */
  android512:     Buffer;
}

export interface OgImageOptions {
  businessName: string;
  tagline?:     string | undefined;
  primaryColor: string;
  /** Defaults to 1200 */
  width?:       number | undefined;
  /** Defaults to 630 */
  height?:      number | undefined;
}

// ---- Re-exports from implementation modules ---------------------------------

export { generateFavicons }    from './favicons.js';
export { optimizeImage }       from './optimize.js';
export type { OptimizeResult } from './optimize.js';
export { generateOgImage }     from './og.js';
export { extractPrimaryColor } from './color.js';
