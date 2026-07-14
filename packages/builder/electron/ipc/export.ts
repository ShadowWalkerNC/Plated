/**
 * export.ts — IPC handlers for site export.
 *
 * Channels:
 *   export:zip    → generate → writeZip → save-dialog → return saved path
 *   export:folder → generate → copy to user-chosen directory
 */
import type { IpcMain, Dialog } from 'electron';
import { generate }  from '@plated/generator';
import { buildAstroProject } from '@plated/astro-output';
import { writeZip }  from '../zip.js';
import type { ProjectSchema } from '@plated/types';
import { join } from 'node:path';

export function registerExportHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  // ── export:zip ────────────────────────────────────────────────────────────────
  ipcMain.handle('export:zip', async (_event, schema: ProjectSchema) => {
    // 1. Pick save destination
    const businessName = (schema as any)?.business?.name ?? 'plated-site';
    const safeName = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Export site as ZIP',
      defaultPath: `${safeName}.zip`,
      filters:     [{ name: 'ZIP Archive', extensions: ['zip'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    try {
      const files = buildAstroProject(schema);
      await writeZip(files, filePath);
      return { ok: true, filePath, fileCount: files.length };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });

  // ── export:folder ─────────────────────────────────────────────────────────────
  ipcMain.handle('export:folder', async (_event, schema: ProjectSchema) => {
    // 1. Pick destination folder
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title:       'Export site to folder',
      buttonLabel: 'Export Here',
      properties:  ['openDirectory', 'createDirectory'],
    });
    if (canceled || !filePaths[0]) return { ok: false, reason: 'cancelled' };

    const businessName = (schema as any)?.business?.name ?? 'plated-site';
    const safeName     = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const destDir      = join(filePaths[0], safeName);

    try {
      const res = await generate(schema, destDir);
      if (!res.success) {
        return { ok: false, reason: res.errors.join(', ') };
      }
      return { ok: true, destDir, fileCount: res.filesWritten };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });
}
