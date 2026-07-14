/**
 * @plated/pdf-tools — QR code generation
 *
 * generateQrDataUrl(): URL → PNG data URL (base64-encoded)
 *   Used by the UI to preview QR codes inline.
 *
 * generateQrBuffer(): URL → PNG Uint8Array
 *   Used by the IPC handler to write to disk.
 *
 * Both run in Node.js. No browser API required.
 */
import QRCode from 'qrcode';

export interface QrOptions {
  /** Square size in pixels (default: 400) */
  size?: number;
  /** Quiet zone module count (default: 2) */
  margin?: number;
  /** Module color (default: '#1e1a17') */
  darkColor?: string;
  /** Background color (default: '#ffffff') */
  lightColor?: string;
  /** Error correction level (default: 'M') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

function qrBaseOptions(opts: QrOptions = {}) {
  return {
    width:  opts.size ?? 400,
    margin: opts.margin ?? 2,
    color: {
      dark:  opts.darkColor  ?? '#1e1a17',
      light: opts.lightColor ?? '#ffffff',
    },
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  };
}

/**
 * Returns a data URL — suitable for <img src={...} /> preview.
 */
export async function generateQrDataUrl(
  url: string,
  opts?: QrOptions,
): Promise<string> {
  return QRCode.toDataURL(url, qrBaseOptions(opts));
}

/**
 * Returns a PNG buffer — suitable for writeFile() on disk.
 */
export async function generateQrBuffer(
  url: string,
  opts?: QrOptions,
): Promise<Uint8Array> {
  const buf = await QRCode.toBuffer(url, qrBaseOptions(opts));
  return new Uint8Array(buf);
}
