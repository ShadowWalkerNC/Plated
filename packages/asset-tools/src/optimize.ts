/**
 * optimize.ts — converts images to WebP and generates blur placeholder
 * data URLs for use as inline <img> src during lazy load.
 *
 * Blur placeholder strategy:
 *   Downsample to 8px wide → quality-20 WebP → base64 data URL.
 *   This is the same pattern used by Next.js blurDataURL and Astro's
 *   experimental:assets. No separate network request needed.
 */
import sharp from 'sharp';

export interface OptimizeResult {
  width:       number;
  height:      number;
  blurDataUrl: string;
}

export async function optimizeImage(
  inputPath:  string,
  outputPath: string,
  options?: { maxWidth?: number; quality?: number },
): Promise<OptimizeResult> {
  const maxWidth = options?.maxWidth ?? 1920;
  const quality  = options?.quality  ?? 82;

  // ---- Main output: WebP at target size ------------------------------------
  const { width = 0, height = 0 } = await sharp(inputPath)
    .resize(maxWidth, undefined, {
      fit:                'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(outputPath);

  // ---- Blur placeholder: 8px-wide WebP → base64 data URL ------------------
  const blurBuf = await sharp(inputPath)
    .resize(8, undefined, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 20 })
    .toBuffer();

  const blurDataUrl = `data:image/webp;base64,${blurBuf.toString('base64')}`;

  return { width, height, blurDataUrl };
}
