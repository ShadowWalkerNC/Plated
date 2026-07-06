// IPC handler — native dialog channels
import type { IpcMain, Dialog } from 'electron';

export function registerDialogHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  ipcMain.handle('dialog:pickOutputDir', async () => {
    const result = await dialog.showOpenDialog({
      title:      'Choose export folder',
      properties: ['openDirectory', 'createDirectory'],
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  ipcMain.handle(
    'dialog:pickFile',
    async (_event, options?: { filters?: Electron.FileFilter[] }) => {
      const result = await dialog.showOpenDialog({
        title:      'Choose a file',
        properties: ['openFile'],
        filters:    options?.filters,
      });
      return result.canceled ? null : result.filePaths[0] ?? null;
    },
  );

  ipcMain.handle(
    'dialog:saveFile',
    async (
      _event,
      options?: { defaultPath?: string; filters?: Electron.FileFilter[] },
    ) => {
      const result = await dialog.showSaveDialog({
        title:       'Save file',
        defaultPath: options?.defaultPath,
        filters:     options?.filters,
      });
      return result.canceled ? null : result.filePath ?? null;
    },
  );
}
