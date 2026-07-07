/**
 * color.ts — extracts the dominant channel-mean color from an image.
 *
 * Why flatten before stats()?
 *   Without flattening, transparent PNGs (logos on alpha backgrounds)
 *   have near-zero alpha pixels that drag the R/G/B means toward black,
 *   returning a useless dark color. Flattening to white first gives a
 *   representative sample of the actual visible color content.
 *
 * Why channel mean rather than raw dominant?
 *   sharp's 'dominant' uses a quantization histogram and often returns
 *   near-white for logos on white. Channel mean is more stable for
 *   branding color extraction when the caller can't pre-crop whitespace.
 */
import sharp from 'sharp';

export async function extractPrimaryColor(imagePath: string): Promise<string> {
  const stats = await sharp(imagePath)
    .flatten({ background: '#ffffff' })
    .resize(100, 100, { fit: 'inside', withoutEnlargement: true })
    .stats();

  const r = stats.channels[0];
  const g = stats.channels[1];
  const b = stats.channels[2];

  if (r === undefined || g === undefined || b === undefined) {
    throw new Error('extractPrimaryColor: unexpected channel count from sharp stats()');
  }

  const toHex = (ch: (typeof r)): string =>
    Math.round(ch.mean).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
