import type { IpcMain, dialog as DialogModule } from 'electron';
import { buildAstroProject } from '@nexcms/astro-output';
import { generate }          from '@nexcms/generator';
import { writeZip }          from '../zip';
import type { ProjectSchema } from '@nexcms/types';
import { tmpdir }            from 'node:os';
import { mkdtemp, rm }       from 'node:fs/promises';
import { join }              from 'node:path';

type Dialog = typeof DialogModule;

export function registerExportHandlers(ipc: IpcMain, dialog: Dialog): void {

  // Export as a ZIP archive to a user-chosen location
  ipc.handle('export:zip', async (_e, schema: ProjectSchema) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Export site as ZIP',
      defaultPath: `${slugify(schema.business.name)}.zip`,
      filters:     [{ name: 'ZIP archive', extensions: ['zip'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    try {
      const files  = buildAstroProject(schema);
      await writeZip(files, filePath);
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });

  // Export to a local folder (full Astro source, ready to run)
  ipc.handle('export:folder', async (_e, schema: ProjectSchema) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title:      'Choose export folder',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (canceled || !filePaths[0]) return { ok: false, reason: 'cancelled' };
    const outputDir = join(filePaths[0], slugify(schema.business.name));

    try {
      const result = await generate(schema, outputDir);
      return { ok: result.success, filePath: outputDir, filesWritten: result.filesWritten, errors: result.errors };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });

  // Preview: build into a tmp dir and return the list of generated files
  ipc.handle('export:preview', async (_e, schema: ProjectSchema) => {
    let tmpDir: string | null = null;
    try {
      tmpDir = await mkdtemp(join(tmpdir(), 'nexcms-preview-'));
      const result = await generate(schema, tmpDir, { dryRun: true });
      return { ok: true, filesWritten: result.filesWritten, warnings: result.warnings };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    } finally {
      if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  });
}

function slugify(s: string): string {
  return (s || 'nexcms-site').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'nexcms-site';
}
