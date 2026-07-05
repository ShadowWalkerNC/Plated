// IPC handler — project save/load channels
// Reads and writes ProjectSchema as JSON on the local filesystem.

import type { IpcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import type { ProjectSchema } from '@nexcms/types';

const MAX_RECENT = 10;
const recentProjects: string[] = [];

export function registerProjectHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    'nexcms:project:save',
    async (_event, payload: { schema: ProjectSchema; filePath: string }) => {
      await writeFile(
        payload.filePath,
        JSON.stringify(payload.schema, null, 2),
        'utf-8',
      );
      trackRecent(payload.filePath);
    },
  );

  ipcMain.handle(
    'nexcms:project:load',
    async (_event, payload: { filePath: string }): Promise<ProjectSchema> => {
      const raw = await readFile(payload.filePath, 'utf-8');
      const schema = JSON.parse(raw) as ProjectSchema;
      trackRecent(payload.filePath);
      return schema;
    },
  );

  ipcMain.handle('nexcms:project:recent', () => [...recentProjects]);
}

function trackRecent(filePath: string): void {
  const idx = recentProjects.indexOf(filePath);
  if (idx !== -1) recentProjects.splice(idx, 1);
  recentProjects.unshift(filePath);
  if (recentProjects.length > MAX_RECENT) recentProjects.length = MAX_RECENT;
}
