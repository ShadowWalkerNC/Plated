/**
 * shell.ts — IPC wrappers for Electron shell.
 *
 * Channels:
 *   shell:openExternal   → opens URL in the OS default browser
 *   shell:revealInFinder → reveals a file path in Finder / Explorer
 */
import type { IpcMain, Shell } from 'electron';

export function registerShellHandlers(ipcMain: IpcMain, shell: Shell): void {
  // ── shell:openExternal ───────────────────────────────────────────────────────
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error(`shell:openExternal — blocked non-http URL: ${url}`);
    }
    await shell.openExternal(url);
    return { ok: true };
  });

  // ── shell:revealInFinder ─────────────────────────────────────────────────────
  ipcMain.handle('shell:revealInFinder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
    return { ok: true };
  });
}
