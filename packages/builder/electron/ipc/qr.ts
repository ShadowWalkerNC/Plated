/**
 * IPC handler — QR code channels
 *
 * Channels:
 *   qr:generate  — returns a PNG data URL for inline preview
 *   qr:save      — saves the PNG to a user-chosen path
 */
import type { IpcMain, dialog as DialogModule } from 'electron';
import { writeFile }            from 'node:fs/promises';
import { generateQrDataUrl, generateQrBuffer } from '@plated/pdf-tools';
import type { QrOptions }       from '@plated/pdf-tools';

type Dialog = typeof DialogModule;

export function registerQrHandlers(ipc: IpcMain, dialog: Dialog): void {
  // Returns a data URL — renderer can show in <img> immediately
  ipc.handle(
    'qr:generate',
    async (_e, payload: { url: string; opts?: QrOptions }) => {
      try {
        const dataUrl = await generateQrDataUrl(payload.url, payload.opts);
        return { ok: true, dataUrl };
      } catch (err) {
        return { ok: false, reason: err instanceof Error ? err.message : String(err) };
      }
    },
  );

  // Saves the QR PNG to disk
  ipc.handle(
    'qr:save',
    async (_e, payload: { url: string; opts?: QrOptions }) => {
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
    },
  );
}
