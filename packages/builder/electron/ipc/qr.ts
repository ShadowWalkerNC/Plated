/**
 * qr.ts — IPC handlers for QR code generation.
 *
 * Channels:
 *   qr:generate → returns a PNG data-URL (no file written)
 *   qr:save     → generates PNG, prompts save dialog, writes to disk
 */
import type { IpcMain, Dialog } from 'electron';
import { writeFile }            from 'node:fs/promises';
import QRCode                   from 'qrcode';

interface QrOptions {
  size?:            number;   // pixel dimension, default 512
  margin?:          number;   // quiet-zone modules, default 2
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  darkColor?:       string;   // hex, default #000000
  lightColor?:      string;   // hex, default #ffffff
}

async function buildDataUrl(url: string, opts: QrOptions = {}): Promise<string> {
  const { size = 512, margin = 2, errorCorrection = 'M', darkColor = '#000000', lightColor = '#ffffff' } = opts;
  return QRCode.toDataURL(url, {
    width:            size,
    margin,
    errorCorrectionLevel: errorCorrection,
    color: { dark: darkColor, light: lightColor },
  });
}

export function registerQrHandlers(ipcMain: IpcMain, dialog: Dialog): void {
  // ── qr:generate ──────────────────────────────────────────────────────────────
  ipcMain.handle('qr:generate', async (_event, payload: { url: string; opts?: QrOptions }) => {
    const dataUrl = await buildDataUrl(payload.url, payload.opts);
    return { ok: true, dataUrl };
  });

  // ── qr:save ───────────────────────────────────────────────────────────────────
  ipcMain.handle('qr:save', async (_event, payload: { url: string; opts?: QrOptions }) => {
    const dataUrl = await buildDataUrl(payload.url, payload.opts);
    // Strip the data:image/png;base64, prefix
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const { canceled, filePath } = await dialog.showSaveDialog({
      title:       'Save QR code',
      defaultPath: 'qr-code.png',
      filters:     [{ name: 'PNG Image', extensions: ['png'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'cancelled' };

    await writeFile(filePath, buffer);
    return { ok: true, filePath };
  });
}
