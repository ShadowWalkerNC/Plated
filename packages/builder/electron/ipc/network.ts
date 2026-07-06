import type { IpcMain } from 'electron';
import { net }           from 'electron';

export function registerNetworkHandlers(ipc: IpcMain): void {
  // Synchronous online check available to renderer on demand
  ipc.handle('network:isOnline', () => net.isOnline());

  // Probe a URL (used by renderer to test cloud connectivity)
  ipc.handle('network:probe', async (_e, url: string) => {
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 0 };
    }
  });
}
