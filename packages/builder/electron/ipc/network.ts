/**
 * network.ts — IPC handlers for connectivity checks.
 *
 * Channels:
 *   network:isOnline → returns { online: boolean } based on net.isOnline()
 *   network:probe    → makes a HEAD request to a given URL, returns reachability
 *
 * The 'network:change' push channel is emitted from main.ts powerMonitor.
 */
import type { IpcMain } from 'electron';
import { net }         from 'electron';

export function registerNetworkHandlers(ipcMain: IpcMain): void {
  // ── network:isOnline ──────────────────────────────────────────────────────────
  ipcMain.handle('network:isOnline', () => {
    return { ok: true, online: net.isOnline() };
  });

  // ── network:probe ─────────────────────────────────────────────────────────────
  ipcMain.handle('network:probe', async (_event, url: string) => {
    return new Promise<{ ok: boolean; online: boolean; statusCode?: number }>((resolve) => {
      const request = net.request({ method: 'HEAD', url });
      request.on('response', (response) => {
        resolve({ ok: true, online: true, statusCode: response.statusCode });
      });
      request.on('error', () => {
        resolve({ ok: true, online: false });
      });
      request.end();
    });
  });
}
