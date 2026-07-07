import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, makeDialog, type FakeIpc, type FakeDialog } from './ipc-harness.js';

// ---- Module mocks -----------------------------------------------------------

vi.mock('@plated/pdf-tools', () => ({
  generateMenuPdf:   vi.fn(() => new Uint8Array()),
  generateQrDataUrl: vi.fn(async () => 'data:image/png;base64,TESTDATA'),
  generateQrBuffer:  vi.fn(async () => new Uint8Array([0x89, 0x50, 0x4e, 0x47])),
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(async () => undefined),
  readFile:  vi.fn(async () => '{}'),
  mkdir:     vi.fn(async () => undefined),
}));

const { registerQrHandlers }   = await import('../ipc/qr.js');
const { generateQrDataUrl, generateQrBuffer } = await import('@plated/pdf-tools');
const { writeFile }            = await import('node:fs/promises');

// ---- Fixtures ---------------------------------------------------------------

let ipc:    FakeIpc;
let dialog: FakeDialog;

beforeEach(() => {
  ipc    = makeIpc();
  dialog = makeDialog();
  vi.clearAllMocks();
  registerQrHandlers(ipc as any, dialog as any);
});

// ---- qr:generate ------------------------------------------------------------

describe('qr:generate', () => {
  it('returns { ok:true, dataUrl } on success', async () => {
    const result: any = await ipc.invoke('qr:generate', { url: 'https://example.com' });
    expect(result).toEqual({ ok: true, dataUrl: 'data:image/png;base64,TESTDATA' });
  });

  it('passes url and opts to generateQrDataUrl', async () => {
    const opts = { size: 200, errorCorrectionLevel: 'H' as const };
    await ipc.invoke('qr:generate', { url: 'https://example.com', opts });
    expect(generateQrDataUrl).toHaveBeenCalledWith('https://example.com', opts);
  });

  it('passes undefined opts when not provided', async () => {
    await ipc.invoke('qr:generate', { url: 'https://example.com' });
    expect(generateQrDataUrl).toHaveBeenCalledWith('https://example.com', undefined);
  });

  it('returns { ok:false, reason } when generateQrDataUrl throws', async () => {
    vi.mocked(generateQrDataUrl).mockRejectedValueOnce(new Error('qr failed'));
    const result: any = await ipc.invoke('qr:generate', { url: 'https://example.com' });
    expect(result).toMatchObject({ ok: false, reason: 'qr failed' });
  });
});

// ---- qr:save ----------------------------------------------------------------

describe('qr:save', () => {
  it('returns { ok:false, reason:"cancelled" } when dialog is cancelled', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined });
    const result: any = await ipc.invoke('qr:save', { url: 'https://example.com' });
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('returns { ok:true, filePath } on success', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/qr.png' });
    const result: any = await ipc.invoke('qr:save', { url: 'https://example.com' });
    expect(result).toEqual({ ok: true, filePath: '/tmp/qr.png' });
  });

  it('calls generateQrBuffer with url and opts', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/qr.png' });
    const opts = { size: 400 };
    await ipc.invoke('qr:save', { url: 'https://example.com', opts });
    expect(generateQrBuffer).toHaveBeenCalledWith('https://example.com', opts);
  });

  it('writes the buffer to filePath', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/qr.png' });
    await ipc.invoke('qr:save', { url: 'https://example.com' });
    expect(writeFile).toHaveBeenCalledWith(
      '/tmp/qr.png',
      new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    );
  });

  it('returns { ok:false } when generateQrBuffer throws', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/qr.png' });
    vi.mocked(generateQrBuffer).mockRejectedValueOnce(new Error('buffer failed'));
    const result: any = await ipc.invoke('qr:save', { url: 'https://example.com' });
    expect(result).toMatchObject({ ok: false, reason: 'buffer failed' });
  });

  it('returns { ok:false } when writeFile throws', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/qr.png' });
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('write error'));
    const result: any = await ipc.invoke('qr:save', { url: 'https://example.com' });
    expect(result).toMatchObject({ ok: false, reason: 'write error' });
  });

  it('save dialog defaultPath is qr-code.png', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true });
    await ipc.invoke('qr:save', { url: 'https://example.com' });
    const opts = dialog.showSaveDialog.mock.calls[0][0];
    expect(opts.defaultPath).toBe('qr-code.png');
  });
});
