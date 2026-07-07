/**
 * export.ts — IPC handlers for site export.
 *
 * Channels:
 *   export:zip    → generate → writeZip → save-dialog → return saved path
 *   export:folder → generate → copy to user-chosen directory
 */
import type { IpcMain, Dialog } from 'electron';
import { generate }  from '@plated/generator';
import { writeZip }  from '../zip.js';
import type { ProjectSchema } from '@plated/types';
import { cp, rm, mkdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { tmpdir }         from 'node:os';
import { randomUUID }     from 'node:crypto';

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

    // 2. Generate to temp dir
    const tmpOut = join(tmpdir(), `plated-export-${randomUUID()}`);
    try {
      const files = await generate(schema, tmpOut, { includeSource: true });
      await writeZip(files, filePath);
      return { ok: true, filePath, fileCount: files.length };
    } finally {
      await rm(tmpOut, { recursive: true, force: true });
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

    // 2. Generate to temp dir then move
    const tmpOut = join(tmpdir(), `plated-export-${randomUUID()}`);
    try {
      const files = await generate(schema, tmpOut, { includeSource: true });
      await mkdir(destDir, { recursive: true });
      await cp(tmpOut, destDir, { recursive: true });
      return { ok: true, destDir, fileCount: files.length };
    } finally {
      await rm(tmpOut, { recursive: true, force: true });
    }
  });
}
