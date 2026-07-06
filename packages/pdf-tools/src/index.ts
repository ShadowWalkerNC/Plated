/**
 * @plated/pdf-tools
 * Menu PDF export + QR code generation.
 * All functions run in Node.js — used via Electron IPC (Local Builder)
 * and via API routes (SaaS, Phase 4).
 */
export { generateMenuPdf }    from './menu-pdf.js';
export type { MenuPdfOptions } from './menu-pdf.js';
export { generateQrDataUrl, generateQrBuffer } from './qr.js';
export type { QrOptions }      from './qr.js';
