/**
 * pdf.ts — IPC handler for PDF menu export.
 *
 * Channel:
 *   pdf:exportMenu → generates a printable PDF from MenuSchema,
 *                    prompts save dialog, writes file to disk.
 *
 * Implementation delegates to @plated/pdf-tools which wraps jsPDF.
 * That package is Phase 2 work; until it exists this handler is
 * a correct stub that will resolve once pdf-tools is published.
 */
import type { IpcMain, Dialog } from 'electron';
import { writeFile }            from 'node:fs/promises';
import type { MenuSchema }      from '@plated/types';

export function registerPdfHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  ipcMain.handle('pdf:exportMenu', async (_event, schema: MenuSchema) => {
    // Dynamic import so main.ts doesn't hard-error if pdf-tools isn't built yet.
    let generateMenuPdf: (menu: any, opts: any) => Uint8Array;
    try {
      const mod = await import('@plated/pdf-tools');
      generateMenuPdf = mod.generateMenuPdf;
    } catch {
      return { ok: false, reason: '@plated/pdf-tools is not yet available' };
    }

    const business   = (schema as any)?.business;
    const menuTitle  = business?.name ?? 'Menu';
    const tagline    = business?.tagline;
    const accent     = (schema as any)?.branding?.primaryColor ?? '#8a4b2f';
    const menuSchema = (schema as any)?.menu ?? { categories: [] };

    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Save PDF menu',
      defaultPath: `${menuTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      filters:     [{ name: 'PDF Document', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    try {
      const pdfBytes = generateMenuPdf(menuSchema, {
        restaurantName: menuTitle,
        tagline,
        accentColor: accent,
      });
      await writeFile(filePath, Buffer.from(pdfBytes));
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });
}
