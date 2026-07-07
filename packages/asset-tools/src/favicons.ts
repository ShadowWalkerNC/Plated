/**
 * favicons.ts — generates a complete favicon set from a source image.
 *
 * FaviconSet type is defined in index.ts (single source of truth).
 *
 * Output:
 *   ico            — multi-size ICO (16px + 32px frames, spec-compliant)
 *   appleTouchIcon — 180×180 PNG (Apple devices)
 *   android192     — 192×192 PNG (Android / PWA)
 *   android512     — 512×512 PNG (Android splash)
 *
 * Dependencies: sharp only. No external ICO libs.
 */
import sharp from 'sharp';
import type { FaviconSet } from './index.js';

// ---- ICO builder (pure Node.js, no external deps) ---------------------------

/**
 * buildIco — constructs a two-entry ICO file from two PNG Buffers.
 *
 * ICO format (little-endian):
 *   ICONDIR header  (6 bytes)
 *   2× ICONDIRENTRY (16 bytes each)
 *   2× PNG image data (variable)
 */
function buildIco(png16: Buffer, png32: Buffer): Buffer {
  const ENTRY_SIZE  = 16;
  const DATA_OFFSET = 6 + ENTRY_SIZE * 2; // 38 bytes before first image

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved — must be 0
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(2, 4); // image count

  function makeEntry(w: number, h: number, data: Buffer, offset: number): Buffer {
    const e = Buffer.alloc(ENTRY_SIZE);
    e.writeUInt8(w >= 256 ? 0 : w, 0);  // width  (0 means 256)
    e.writeUInt8(h >= 256 ? 0 : h, 1);  // height (0 means 256)
    e.writeUInt8(0, 2);                  // color count (0 = true color)
    e.writeUInt8(0, 3);                  // reserved
    e.writeUInt16LE(1,            4);    // color planes
    e.writeUInt16LE(32,           6);    // bits per pixel
    e.writeUInt32LE(data.length,  8);    // image data size in bytes
    e.writeUInt32LE(offset,      12);    // absolute offset to image data
    return e;
  }

  const entry16 = makeEntry(16, 16, png16, DATA_OFFSET);
  const entry32 = makeEntry(32, 32, png32, DATA_OFFSET + png16.length);

  return Buffer.concat([header, entry16, entry32, png16, png32]);
}

// ---- Public API -------------------------------------------------------------

export async function generateFavicons(sourceImagePath: string): Promise<FaviconSet> {
  // Flatten alpha to white before resizing so transparent logos don't
  // produce black/transparent regions in the ICO frames.
  const src = sharp(sourceImagePath).flatten({ background: '#ffffff' });

  const [png16, png32, appleTouchIcon, android192, android512] = await Promise.all([
    src.clone().resize(16,  16,  { fit: 'cover', position: 'attention' }).png().toBuffer(),
    src.clone().resize(32,  32,  { fit: 'cover', position: 'attention' }).png().toBuffer(),
    src.clone().resize(180, 180, { fit: 'cover', position: 'attention' }).png().toBuffer(),
    src.clone().resize(192, 192, { fit: 'cover', position: 'attention' }).png().toBuffer(),
    src.clone().resize(512, 512, { fit: 'cover', position: 'attention' }).png().toBuffer(),
  ]);

  return {
    ico: buildIco(png16, png32),
    appleTouchIcon,
    android192,
    android512,
  };
}
