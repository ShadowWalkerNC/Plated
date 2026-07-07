import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, makeDialog, MINIMAL_SCHEMA, type FakeIpc, type FakeDialog } from './ipc-harness.js';

// ---- Module mocks -----------------------------------------------------------

const FAKE_BUFFER = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF

vi.mock('@plated/pdf-tools', () => ({
  generateMenuPdf:   vi.fn(() => FAKE_BUFFER),
  generateQrDataUrl: vi.fn(async () => 'data:image/png;base64,abc'),
  generateQrBuffer:  vi.fn(async () => new Uint8Array([0x89, 0x50, 0x4e, 0x47])),
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(async () => undefined),
  readFile:  vi.fn(async () => '{}'),
  mkdir:     vi.fn(async () => undefined),
}));

const { registerPdfHandlers }  = await import('../ipc/pdf.js');
const { generateMenuPdf }      = await import('@plated/pdf-tools');
const { writeFile }            = await import('node:fs/promises');

// ---- Fixtures ---------------------------------------------------------------

let ipc:    FakeIpc;
let dialog: FakeDialog;

beforeEach(() => {
  ipc    = makeIpc();
  dialog = makeDialog();
  vi.clearAllMocks();
  registerPdfHandlers(ipc as any, dialog as any);
});

// ---- pdf:exportMenu ---------------------------------------------------------

describe('pdf:exportMenu', () => {
  it('returns { ok:false, reason:"cancelled" } when dialog is cancelled', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined });
    const result = await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('returns { ok:true, filePath } on success', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/menu.pdf' });
    const result = await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(result).toEqual({ ok: true, filePath: '/tmp/menu.pdf' });
  });

  it('calls generateMenuPdf with menu and correct options', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/menu.pdf' });
    await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(generateMenuPdf).toHaveBeenCalledWith(
      MINIMAL_SCHEMA.menu,
      {
        restaurantName: 'The Rusty Fork',
        tagline:        'Food worth driving for.',
        accentColor:    '#8a4b2f',
      },
    );
  });

  it('writes the buffer returned by generateMenuPdf to filePath', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/menu.pdf' });
    await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(writeFile).toHaveBeenCalledWith('/tmp/menu.pdf', FAKE_BUFFER);
  });

  it('defaultPath in save dialog is slug + "-menu.pdf"', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true });
    await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    const opts = dialog.showSaveDialog.mock.calls[0][0];
    expect(opts.defaultPath).toBe('the-rusty-fork-menu.pdf');
  });

  it('returns { ok:false, reason } when generateMenuPdf throws', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/menu.pdf' });
    vi.mocked(generateMenuPdf).mockImplementationOnce(() => { throw new Error('pdf exploded'); });
    const result: any = await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(result).toMatchObject({ ok: false, reason: 'pdf exploded' });
  });

  it('returns { ok:false, reason } when writeFile throws', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/menu.pdf' });
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'));
    const result: any = await ipc.invoke('pdf:exportMenu', MINIMAL_SCHEMA);
    expect(result).toMatchObject({ ok: false, reason: 'disk full' });
  });
});
