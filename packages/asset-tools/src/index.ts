// @nexcms/asset-tools — Phase 1 stub
// Tools: sharp (image optimization, favicons) + satori (OG images)
// No Python. No Puppeteer. No headless browser. Node.js only.

export interface FaviconSet {
  /** favicon.ico (16x16, 32x32 multi-size) */
  ico: Buffer;
  /** apple-touch-icon.png (180x180) */
  appleTouchIcon: Buffer;
  /** android-chrome-192x192.png */
  android192: Buffer;
  /** android-chrome-512x512.png */
  android512: Buffer;
}

export interface OgImageOptions {
  businessName: string;
  tagline?: string | undefined;
  primaryColor: string;
  /** Width: 1200, Height: 630 (standard OG) */
  width?: number | undefined;
  height?: number | undefined;
}

/**
 * generateFavicons — produces a full favicon set from a source image.
 * Source should be at minimum 512×512 PNG or SVG.
 */
export async function generateFavicons(
  _sourceImagePath: string,
): Promise<FaviconSet> {
  throw new Error('asset-tools.generateFavicons() not yet implemented. Phase 1.');
}

/**
 * optimizeImage — converts to WebP, resizes if needed, adds blur placeholder.
 */
export async function optimizeImage(
  _inputPath: string,
  _outputPath: string,
  _options?: { maxWidth?: number; quality?: number },
): Promise<{ width: number; height: number; blurDataUrl: string }> {
  throw new Error('asset-tools.optimizeImage() not yet implemented. Phase 1.');
}

/**
 * generateOgImage — produces a branded 1200×630 PNG OG image.
 * Uses satori (JSX → SVG) + sharp (SVG → PNG). No headless browser.
 */
export async function generateOgImage(
  _options: OgImageOptions,
): Promise<Buffer> {
  throw new Error('asset-tools.generateOgImage() not yet implemented. Phase 1.');
}

/**
 * extractPrimaryColor — samples the dominant color from a logo image.
 */
export async function extractPrimaryColor(
  _imagePath: string,
): Promise<string> {
  throw new Error('asset-tools.extractPrimaryColor() not yet implemented. Phase 1.');
}
