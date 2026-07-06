/**
 * IPC handler — background removal
 *
 * Channel: 'media:removeBackground'
 * Payload: imagePath (absolute local path or https:// URL)
 * Returns: { ok: true, resultUrl: string } | { ok: false, reason: string }
 *
 * Why a hidden BrowserWindow?
 * @imgly/background-removal uses WebAssembly + Web Workers + fetch —
 * all browser APIs that are unavailable in the Node.js main process.
 * We spin up a hidden offscreen renderer (bg-worker.html), send it
 * the image path, receive the processed ArrayBuffer back via IPC,
 * then destroy the window. The whole round-trip is transparent to
 * the renderer that called window.plated.removeBackground().
 */
import { type IpcMain, BrowserWindow, ipcMain as _ipcMain } from 'electron';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

export function registerBackgroundHandlers(ipc: IpcMain): void {
  ipc.handle('media:removeBackground', async (_e, imagePath: string) => {
    let workerWindow: BrowserWindow | null = null;

    try {
      // ─ Resolve image to a data URL so the worker can load it cross-origin-free
      let imageDataUrl: string;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // Remote URL — pass as-is; the worker fetch() will handle it
        imageDataUrl = imagePath;
      } else {
        // Local file — read and base64-encode
        const localPath = imagePath.startsWith('file://')
          ? decodeURIComponent(imagePath.slice(7))
          : imagePath;
        const buf  = await readFile(localPath);
        const ext  = localPath.split('.').pop()?.toLowerCase() ?? 'png';
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
          : ext === 'webp' ? 'image/webp'
          : 'image/png';
        imageDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      }

      // ─ Spawn hidden offscreen renderer
      workerWindow = new BrowserWindow({
        show: false,
        width: 1,
        height: 1,
        webPreferences: {
          contextIsolation: false,   // needed so worker HTML can use ipcRenderer directly
          nodeIntegration: true,
          offscreen: true,
        },
      });

      const workerHtml = join(__dirname, '..', 'bg-worker.html');
      await workerWindow.loadFile(workerHtml);

      // ─ Wait for the worker result via a one-shot IPC reply
      const result = await new Promise<{ ok: boolean; buffer?: ArrayBuffer; reason?: string }>(
        (resolve) => {
          const timeout = setTimeout(() => {
            resolve({ ok: false, reason: 'Background removal timed out (60 s)' });
          }, 60_000);

          _ipcMain.once('bg:result', (_ev, payload: { ok: boolean; buffer?: ArrayBuffer; reason?: string }) => {
            clearTimeout(timeout);
            resolve(payload);
          });

          // Kick off processing in the worker window
          workerWindow?.webContents.send('bg:process', imageDataUrl);
        },
      );

      if (!result.ok || !result.buffer) {
        return { ok: false, reason: result.reason ?? 'No output buffer' };
      }

      // ─ Convert ArrayBuffer → base64 PNG data URL
      const resultBuf    = Buffer.from(result.buffer);
      const resultDataUrl = `data:image/png;base64,${resultBuf.toString('base64')}`;
      return { ok: true, resultUrl: resultDataUrl };

    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    } finally {
      workerWindow?.destroy();
      workerWindow = null;
    }
  });
}
