/**
 * background.ts — IPC handler for background removal.
 *
 * Channel:
 *   bg:remove → loads an image file into an off-screen BrowserWindow
 *               running bg-worker.html, which calls @imgly/background-removal
 *               and returns an ArrayBuffer of the processed PNG.
 *
 * The bg-worker.html page is loaded into a hidden BrowserWindow.
 * It reads the image bytes sent via 'bg:doRemove' and posts the result
 * back via 'bg:result'.
 */
import type { IpcMain }  from 'electron';
import { BrowserWindow } from 'electron';
import { readFile }      from 'node:fs/promises';
import { join }          from 'node:path';

export function registerBackgroundHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('bg:remove', async (_event, imagePath: string): Promise<{
    ok: boolean;
    buffer?: Buffer;
    reason?: string;
  }> => {
    const imageBytes = await readFile(imagePath);

    // Spin up a hidden off-screen window that runs the WASM bg-removal library.
    const worker = new BrowserWindow({
      show:            false,
      width:           1,
      height:          1,
      webPreferences:  {
        nodeIntegration:  false,
        contextIsolation: true,
        offscreen:        true,
      },
    });

    const workerHtml = join(__dirname, '..', 'bg-worker.html');
    await worker.loadFile(workerHtml);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        worker.destroy();
        resolve({ ok: false, reason: 'background removal timed out (30 s)' });
      }, 30_000);

      // Receive the result from the worker page via ipcMain once
      ipcMain.once('bg:result', (_e, result: { ok: boolean; buffer?: ArrayBuffer; error?: string }) => {
        clearTimeout(timeout);
        worker.destroy();
        if (!result.ok || !result.buffer) {
          resolve({ ok: false, reason: result.error ?? 'unknown error' });
        } else {
          resolve({ ok: true, buffer: Buffer.from(result.buffer) });
        }
      });

      // Send the raw bytes to the worker
      worker.webContents.send('bg:doRemove', imageBytes.buffer);
    });
  });
}
