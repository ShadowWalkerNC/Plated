/**
 * updater.ts — IPC handlers for electron-updater auto-update.
 *
 * Channels:
 *   updater:check   → manually trigger an update check
 *   updater:install → quit and install a downloaded update
 *   updater:version → returns the current running app version
 *
 * Update lifecycle events are pushed to the renderer via
 * 'updater:event' (handled by main.ts configureAutoUpdater).
 */
import type { IpcMain }   from 'electron';
import { app }            from 'electron';
import type { AppUpdater } from 'electron-updater';
import type { BrowserWindow } from 'electron';

export function registerUpdateHandlers(
  ipcMain: IpcMain,
  autoUpdater: AppUpdater,
  mainWindow: BrowserWindow | null,
): void {
  // ── updater:check ─────────────────────────────────────────────────────────────
  ipcMain.handle('updater:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, result };
    } catch (err: unknown) {
      return { ok: false, reason: (err as Error).message };
    }
  });

  // ── updater:install ───────────────────────────────────────────────────────────
  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall();
    return { ok: true };
  });

  // ── updater:version ───────────────────────────────────────────────────────────
  ipcMain.handle('updater:version', () => {
    return { ok: true, version: app.getVersion() };
  });
}
