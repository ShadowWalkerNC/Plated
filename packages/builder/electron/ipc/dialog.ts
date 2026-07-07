/**
 * dialog.ts — IPC wrappers for Electron dialog.show*.
 *
 * Channels:
 *   dialog:pickOutputDir  → open-directory dialog → string | null
 *   dialog:pickFile       → open-file dialog → string | null
 *   dialog:saveFile       → save dialog → string | null
 */
import type { IpcMain, Dialog } from 'electron';

export function registerDialogHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  // ── dialog:pickOutputDir ─────────────────────────────────────────────────────
  ipcMain.handle('dialog:pickOutputDir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title:      'Choose output folder',
      buttonLabel: 'Select Folder',
      properties: ['openDirectory', 'createDirectory'],
    });
    return canceled ? null : filePaths[0] ?? null;
  });

  // ── dialog:pickFile ──────────────────────────────────────────────────────────
  ipcMain.handle('dialog:pickFile', async (_event, options?: Electron.OpenDialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      ...options,
    });
    return canceled ? null : filePaths[0] ?? null;
  });

  // ── dialog:saveFile ──────────────────────────────────────────────────────────
  ipcMain.handle('dialog:saveFile', async (_event, options?: Electron.SaveDialogOptions) => {
    const { canceled, filePath } = await dialog.showSaveDialog(options ?? {});
    return canceled ? null : filePath ?? null;
  });
}
