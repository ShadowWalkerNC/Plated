// IPC handler — generator channels
// Bridges nexcms:generate + nexcms:generate:dryRun to @nexcms/generator

import type { IpcMain } from 'electron';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '@nexcms/generator';
import type { ProjectSchema } from '@nexcms/types';

export function registerGeneratorHandlers(ipcMain: IpcMain): void {
  // Full generation — writes to outputDir
  ipcMain.handle(
    'nexcms:generate',
    async (
      _event,
      payload: { schema: ProjectSchema; outputDir: string; includeSource: boolean },
    ) => {
      return generate(payload.schema, {
        outputDir: payload.outputDir,
        includeSource: payload.includeSource ?? true,
        dryRun: false,
      });
    },
  );

  // Dry-run — resolves template and returns file count + warnings without writing
  ipcMain.handle(
    'nexcms:generate:dryRun',
    async (_event, payload: { schema: ProjectSchema }) => {
      return generate(payload.schema, {
        outputDir: join(tmpdir(), 'nexcms-dryrun'),
        includeSource: true,
        dryRun: true,
      });
    },
  );
}
