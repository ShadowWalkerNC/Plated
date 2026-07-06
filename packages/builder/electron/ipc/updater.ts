import type { IpcMain, BrowserWindow } from 'electron';
import type { AppUpdater } from 'electron-updater';

export function registerUpdateHandlers(
  ipc:     IpcMain,
  updater: AppUpdater,
  win:     BrowserWindow | null,
): void {
  // Renderer can manually trigger an update check
  ipc.handle('updater:check', async () => {
    try {
      const result = await updater.checkForUpdates();
      return { ok: true, updateInfo: result?.updateInfo ?? null };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  // Quit and install the downloaded update
  ipc.handle('updater:install', () => {
    updater.quitAndInstall(false, true);
  });

  // Expose current app version
  ipc.handle('updater:version', () => {
    const { app } = require('electron') as typeof import('electron');
    return app.getVersion();
  });
}
