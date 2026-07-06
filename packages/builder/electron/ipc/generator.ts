// IPC handler — generator channels
import type { IpcMain } from 'electron';
import { tmpdir } from 'node:os';
import { join }   from 'node:path';
import { generate } from '@plated/generator';
import type { ProjectSchema } from '@plated/types';

export function registerGeneratorHandlers(ipcMain: IpcMain): void {
  // Full generation — writes to outputDir
  ipcMain.handle(
    'generate',
    async (
      _event,
      payload: { schema: ProjectSchema; outputDir: string; includeSource?: boolean },
    ) => {
      return generate(payload.schema, payload.outputDir);
    },
  );

  // Dry-run — returns file count + warnings without writing
  ipcMain.handle(
    'generate:dryRun',
    async (_event, payload: { schema: ProjectSchema }) => {
      return generate(payload.schema, join(tmpdir(), 'plated-dryrun'), { dryRun: true });
    },
  );
}
