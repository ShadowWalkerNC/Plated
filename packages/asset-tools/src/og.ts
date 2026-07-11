/**
 * og.ts — generates a branded 1200×630 Open Graph PNG.
 *
 * Pipeline: satori (object tree → SVG) → sharp (SVG → PNG buffer)
 * No Puppeteer. No headless Chrome. Node.js 22 only. (Architecture D2)
 *
 * OgImageOptions type is defined in index.ts (single source of truth).
 *
 * Font loading:
 *   Tries to locate Inter Regular woff from @fontsource/inter at three
 *   candidate pnpm hoist paths. If none found → fallback renderer.
 *
 * Fallback renderer:
 *   If satori throws for any reason (missing font, CSS gap, etc.) the
 *   function falls back to a minimal sharp SVG composite. The pipeline
 *   never hard-crashes on a fresh clone or missing font asset.
 */
import sharp  from 'sharp';
import satori from 'satori';
import { readFile }       from 'node:fs/promises';
import { join, dirname }  from 'node:path';
import { fileURLToPath }  from 'node:url';
import type { OgImageOptions } from './index.js';

const OG_W = 1200;
const OG_H = 630;

// ---- Font loader ------------------------------------------------------------

async function tryLoadFont(): Promise<ArrayBuffer | null> {
  const base = __dirname;
  const candidates = [
    join(base, '../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
    join(base, '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
    join(base, '../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
  ];
  for (const p of candidates) {
    try {
      const buf = await readFile(p);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch { /* try next */ }
  }
  return null;
}

// ---- Helpers ----------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g,  '&apos;');
}

function hexToRgba(hex: string, alpha = 1): string {
  const h    = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r    = parseInt(full.slice(0, 2), 16);
  const g    = parseInt(full.slice(2, 4), 16);
  const b    = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---- Fallback PNG (no satori / no font) -------------------------------------

async function fallbackOgImage(opts: OgImageOptions): Promise<Buffer> {
  const bg   = opts.primaryColor || '#1a1a1a';
  const name = escapeXml(opts.businessName || 'Plated Site');
  const tag  = opts.tagline ? escapeXml(opts.tagline) : '';

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">`,
    `  <rect width="${OG_W}" height="${OG_H}" fill="${bg}"/>`,
    `  <rect x="60" y="60" width="${OG_W - 120}" height="${OG_H - 120}" rx="20" fill="rgba(255,255,255,0.12)"/>`,
    `  <text x="100" y="280" font-family="sans-serif" font-size="72" font-weight="bold" fill="white">${name}</text>`,
    tag ? `  <text x="100" y="360" font-family="sans-serif" font-size="32" fill="rgba(255,255,255,0.85)">${tag}</text>` : '',
    `  <text x="100" y="560" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.5)">Made with Plated</text>`,
    `</svg>`,
  ].filter(Boolean).join('\n');

  return sharp(Buffer.from(svg)).resize(OG_W, OG_H).png().toBuffer();
}

// ---- Satori render ----------------------------------------------------------

export async function generateOgImage(opts: OgImageOptions): Promise<Buffer> {
  const {
    businessName,
    tagline,
    primaryColor = '#1a1a1a',
    width  = OG_W,
    height = OG_H,
  } = opts;

  const fontData = await tryLoadFont();
  if (!fontData) return fallbackOgImage(opts);

  try {
    const panelW  = Math.round(width * 0.66);
    const accentW = width - panelW;

    const nameNode = {
      type: 'div',
      props: {
        style: { display: 'flex', fontSize: 64, fontWeight: 'bold', color: '#ffffff', lineHeight: 1.1 },
        children: [businessName],
      },
    };

    const taglineNode = tagline
      ? [{
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: 28, color: hexToRgba('#ffffff', 0.85) },
            children: [tagline],
          },
        }]
      : [];

    const footerNode = {
      type: 'div',
      props: {
        style: { display: 'flex', fontSize: 18, color: hexToRgba('#ffffff', 0.5), marginTop: 'auto', paddingTop: '40px' },
        children: ['Made with Plated'],
      },
    };

    const tree = {
      type: 'div',
      props: {
        style: { display: 'flex', width: `${width}px`, height: `${height}px`, background: primaryColor },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display:        'flex',
                flexDirection:  'column',
                justifyContent: 'center',
                width:          `${panelW}px`,
                height:         `${height}px`,
                background:     'rgba(255,255,255,0.10)',
                padding:        '60px',
                gap:            '16px',
              },
              children: [nameNode, ...taglineNode, footerNode],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display:    'flex',
                width:      `${accentW}px`,
                height:     `${height}px`,
                background: hexToRgba(primaryColor, 0.7),
              },
              children: [],
            },
          },
        ],
      },
    };

    const svg = await satori(tree as Parameters<typeof satori>[0], {
      width,
      height,
      fonts: [{ name: 'Inter', data: fontData, weight: 400, style: 'normal' }],
    });

    return sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
  } catch {
    return fallbackOgImage(opts);
  }
}
