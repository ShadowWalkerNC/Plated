/**
 * generator.ts — IPC handlers for the Plated generator pipeline.
 *
 * Channels:
 *   generate        → runs the full generate() pipeline (files written to outputDir)
 *   generate:dryRun → returns the file plan without writing anything
 */
import type { IpcMain } from 'electron';
import { generate, dryRun } from '@plated/generator';
import type { ProjectSchema } from '@plated/types';

export function registerGeneratorHandlers(ipcMain: IpcMain): void {
  // ── generate ────────────────────────────────────────────────────────────────
  ipcMain.handle('generate', async (_event, payload: {
    schema: ProjectSchema;
    outputDir: string;
    includeSource?: boolean;
  }) => {
    const { schema, outputDir, includeSource = false } = payload;
    const files = await generate(schema, outputDir, { includeSource });
    return { ok: true, fileCount: files.length, outputDir };
  });

  // ── generate:dryRun ─────────────────────────────────────────────────────────
  ipcMain.handle('generate:dryRun', async (_event, payload: {
    schema: ProjectSchema;
  }) => {
    const files = await dryRun(payload.schema);
    return { ok: true, files: files.map(f => f.path) };
  });
}
