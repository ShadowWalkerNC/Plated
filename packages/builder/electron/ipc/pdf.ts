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
    let generateMenuPdf: (schema: MenuSchema) => Promise<Buffer>;
    try {
      const mod = await import('@plated/pdf-tools');
      generateMenuPdf = mod.generateMenuPdf;
    } catch {
      return { ok: false, reason: '@plated/pdf-tools is not yet available' };
    }

    const menuTitle  = (schema as any)?.name ?? 'menu';
    const safeName   = menuTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Save PDF menu',
      defaultPath: `${safeName}.pdf`,
      filters:     [{ name: 'PDF Document', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    const buffer = await generateMenuPdf(schema);
    await writeFile(filePath, buffer);
    return { ok: true, filePath };
  });
}
