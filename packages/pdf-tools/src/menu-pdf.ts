/**
 * @plated/pdf-tools — Menu PDF generator
 *
 * Produces a print-ready PDF from a MenuSchema.
 * Returns a Uint8Array (buffer) — no filesystem access.
 * The IPC handler (ipc/pdf.ts) is responsible for writing to disk.
 *
 * Layout:
 *   Page 1: Cover — restaurant name + optional tagline
 *   Pages 2+: Menu categories, each with item rows
 *
 * Font: Helvetica (built-in jsPDF, no embed needed)
 * Page size: Letter (216 × 279 mm) — US standard
 */
import { jsPDF } from 'jspdf';
import type { MenuSchema, MenuCategory, MenuItem, DietaryTag } from '@plated/types';

export interface MenuPdfOptions {
  restaurantName: string;
  tagline?: string;
  /** Hex color for headings e.g. '#8a4b2f' */
  accentColor?: string;
  pageSize?: 'letter' | 'a4';
}

const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian:       'V',
  vegan:            'VE',
  'gluten-free':    'GF',
  'dairy-free':     'DF',
  'nut-free':       'NF',
  halal:            'HL',
  kosher:           'KS',
  spicy:            '🌶',
  'contains-alcohol': 'ALC',
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function generateMenuPdf(
  menu: MenuSchema,
  opts: MenuPdfOptions,
): Uint8Array {
  const pageSize = opts.pageSize ?? 'letter';
  const accent   = opts.accentColor ?? '#8a4b2f';
  const [ar, ag, ab] = hexToRgb(accent);

  const doc = new jsPDF({ unit: 'mm', format: pageSize, orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ml = 20; // margin left
  const mr = W - 20; // margin right

  // ─── Cover page ────────────────────────────────────────────────────
  doc.setFillColor(ar, ag, ab);
  doc.rect(0, 0, W, 48, 'F');

  doc.setTextColor(255, 248, 242);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(opts.restaurantName, W / 2, 28, { align: 'center' });

  if (opts.tagline) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(opts.tagline, W / 2, 38, { align: 'center' });
  }

  doc.setTextColor(ar, ag, ab);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MENU', W / 2, 64, { align: 'center' });

  // Thin rule under MENU heading
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.4);
  doc.line(ml, 67, mr, 67);

  let y = 78;

  const categories = menu.categories
    .slice()
    .sort((a: MenuCategory, b: MenuCategory) => a.displayOrder - b.displayOrder);

  for (const cat of categories) {
    // ─── Check if we need a new page ──────────────────────────────
    if (y > H - 30) {
      doc.addPage();
      y = 20;
    }

    // ─── Category header ──────────────────────────────────────────
    doc.setFillColor(ar, ag, ab);
    doc.setDrawColor(ar, ag, ab);
    doc.roundedRect(ml, y, mr - ml, 8, 1.5, 1.5, 'F');
    doc.setTextColor(255, 248, 242);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(cat.name.toUpperCase(), ml + 4, y + 5.5);
    y += 12;

    if (cat.description) {
      doc.setTextColor(100, 90, 80);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text(cat.description, ml, y);
      y += 6;
    }

    // ─── Items ────────────────────────────────────────────────────
    const items = cat.items
      .filter((i: MenuItem) => i.available)
      .sort((a: MenuItem, b: MenuItem) => a.displayOrder - b.displayOrder);

    for (const item of items) {
      if (y > H - 24) {
        doc.addPage();
        y = 20;
      }
      y = renderItem(doc, item, ml, mr, y, ar, ag, ab);
    }

    y += 6; // gap after category
  }

  // ─── Footer on every page ──────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 150, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${opts.restaurantName} — Page ${p} of ${pageCount}`,
      W / 2,
      H - 8,
      { align: 'center' },
    );
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

function renderItem(
  doc: jsPDF,
  item: MenuItem,
  ml: number,
  mr: number,
  y: number,
  ar: number, ag: number, ab: number,
): number {
  const nameWidth = mr - ml - 28;

  // Item name
  doc.setTextColor(30, 26, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const nameLines = doc.splitTextToSize(item.name, nameWidth) as string[];
  doc.text(nameLines, ml, y);

  // Price — right-aligned on same line as name
  if (item.price) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(ar, ag, ab);
    doc.text(item.price, mr, y, { align: 'right' });
  }

  y += nameLines.length * 4.5;

  // Dietary tags
  if (item.dietaryTags?.length) {
    const tagStr = item.dietaryTags.map((t: DietaryTag) => DIETARY_LABELS[t]).join('  ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 98, 84);
    doc.text(tagStr, ml, y);
    y += 4;
  }

  // Description
  if (item.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 80, 70);
    const descLines = doc.splitTextToSize(item.description, mr - ml) as string[];
    doc.text(descLines, ml, y);
    y += descLines.length * 4;
  }

  // Thin divider
  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.2);
  doc.line(ml, y + 1, mr, y + 1);
  y += 5;

  return y;
}
