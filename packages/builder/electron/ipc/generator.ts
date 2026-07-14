/**
 * generator.ts — IPC handlers for the Plated generator pipeline.
 *
 * Channels:
 *   generate        → runs the full generate() pipeline (files written to outputDir)
 *   generate:dryRun → returns the file plan without writing anything
 */
import type { IpcMain } from 'electron';
import { generate } from '@plated/generator';
import { buildAstroProject } from '@plated/astro-output';
import type { ProjectSchema } from '@plated/types';

export function registerGeneratorHandlers(ipcMain: IpcMain): void {
  // ── generate ────────────────────────────────────────────────────────────────
  ipcMain.handle('generate', async (_event, payload: {
    schema: ProjectSchema;
    outputDir: string;
  }) => {
    const { schema, outputDir } = payload;
    const res = await generate(schema, outputDir);
    return { ok: res.success, fileCount: res.filesWritten, outputDir, errors: res.errors };
  });

  // ── generate:dryRun ─────────────────────────────────────────────────────────
  ipcMain.handle('generate:dryRun', async (_event, payload: {
    schema: ProjectSchema;
  }) => {
    const files = buildAstroProject(payload.schema);
    return { ok: true, files: files.map(f => f.path) };
  });
}
