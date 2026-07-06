// IPC handler — shell channels
import type { IpcMain, Shell } from 'electron';

export function registerShellHandlers(ipcMain: IpcMain, shell: Shell): void {
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error(`[ipc/shell] openExternal rejected unsafe URL: ${url}`);
    }
    await shell.openExternal(url);
  });

  ipcMain.handle('shell:revealInFinder', async (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });
}
