/**
 * qr.ts — IPC handlers for QR code generation.
 *
 * Channels:
 *   qr:generate → returns a PNG data-URL (no file written)
 *   qr:save     → generates PNG, prompts save dialog, writes to disk
 */
import type { IpcMain, Dialog } from 'electron';
import { writeFile }            from 'node:fs/promises';
import { generateQrDataUrl, generateQrBuffer } from '@plated/pdf-tools';

export function registerQrHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  // ── qr:generate ──────────────────────────────────────────────────────────────
  ipcMain.handle('qr:generate', async (_event, payload: { url: string; opts?: any }) => {
    try {
      const dataUrl = await generateQrDataUrl(payload.url, payload.opts);
      return { ok: true, dataUrl };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });

  // ── qr:save ───────────────────────────────────────────────────────────────────
  ipcMain.handle('qr:save', async (_event, payload: { url: string; opts?: any }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Save QR code',
      defaultPath: 'qr-code.png',
      filters:     [{ name: 'PNG Image', extensions: ['png'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    try {
      const buffer = await generateQrBuffer(payload.url, payload.opts);
      await writeFile(filePath, buffer);
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  });
}
