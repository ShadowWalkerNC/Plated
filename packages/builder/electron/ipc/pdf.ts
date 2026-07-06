/**
 * IPC handler — PDF export channels
 *
 * Channels:
 *   pdf:exportMenu  — saves a printable menu PDF to a user-chosen path
 *
 * All heavy lifting is in @plated/pdf-tools. This file only:
 *   1. Shows a native Save dialog
 *   2. Calls generateMenuPdf()
 *   3. Writes the buffer to disk
 *   4. Returns { ok, filePath? } to the renderer
 */
import type { IpcMain, dialog as DialogModule } from 'electron';
import { writeFile }         from 'node:fs/promises';
import { generateMenuPdf }   from '@plated/pdf-tools';
import type { ProjectSchema } from '@plated/types';

type Dialog = typeof DialogModule;

export function registerPdfHandlers(ipc: IpcMain, dialog: Dialog): void {
  ipc.handle('pdf:exportMenu', async (_e, schema: ProjectSchema) => {
    const name = schema.business.name || 'menu';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'menu';

    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Save menu PDF',
      defaultPath: `${slug}-menu.pdf`,
      filters:     [{ name: 'PDF Document', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    try {
      const buffer = generateMenuPdf(schema.menu, {
        restaurantName: schema.business.name,
        tagline:        schema.business.tagline,
        accentColor:    schema.branding.primaryColor,
      });
      await writeFile(filePath, buffer);
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });
}
