/**
 * project.ts — IPC handlers for project.plated.json read/write.
 *
 * Channels:
 *   project:save   → writes ProjectSchema to disk as JSON
 *   project:load   → reads and validates project.plated.json
 *   project:recent → returns the MRU list of recently opened project paths
 *
 * Future: ENCRYPTION_KEY env var → AES-256-GCM encrypt before write.
 * For now files are stored as plain UTF-8 JSON (safe for local-only use).
 */
import type { IpcMain } from 'electron';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve }           from 'node:path';
import type { ProjectSchema }         from '@plated/types';

// ── MRU list ────────────────────────────────────────────────────────────────────
const MAX_RECENT = 10;
const recentProjects: string[] = [];

function addToRecent(filePath: string): void {
  const abs = resolve(filePath);
  const idx = recentProjects.indexOf(abs);
  if (idx !== -1) recentProjects.splice(idx, 1);
  recentProjects.unshift(abs);
  if (recentProjects.length > MAX_RECENT) recentProjects.length = MAX_RECENT;
}

// ── Handlers ─────────────────────────────────────────────────────────────────────
export function registerProjectHandlers(ipcMain: IpcMain): void {
  // ── project:save ─────────────────────────────────────────────────────────────
  ipcMain.handle('project:save', async (_event, payload: {
    schema: ProjectSchema;
    filePath: string;
  }) => {
    const abs = resolve(payload.filePath);
    await mkdir(dirname(abs), { recursive: true });
    const json = JSON.stringify(payload.schema, null, 2);
    await writeFile(abs, json, 'utf8');
    addToRecent(abs);
    return { ok: true, filePath: abs };
  });

  // ── project:load ─────────────────────────────────────────────────────────────
  ipcMain.handle('project:load', async (_event, payload: { filePath: string }) => {
    const abs  = resolve(payload.filePath);
    const raw  = await readFile(abs, 'utf8');
    const data = JSON.parse(raw) as ProjectSchema;
    addToRecent(abs);
    return { ok: true, schema: data, filePath: abs };
  });

  // ── project:recent ───────────────────────────────────────────────────────────
  ipcMain.handle('project:recent', () => {
    return { ok: true, paths: [...recentProjects] };
  });
}
