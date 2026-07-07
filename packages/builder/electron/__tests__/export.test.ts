import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, makeDialog, MINIMAL_SCHEMA, type FakeIpc, type FakeDialog } from './ipc-harness.js';

// ---- Module mocks -----------------------------------------------------------

vi.mock('@plated/astro-output', () => ({
  buildAstroProject: vi.fn(() => [{ path: 'index.html', content: '<html/>' }]),
}));

vi.mock('@plated/generator', () => ({
  generate: vi.fn(async () => ({ success: true, filesWritten: 3, errors: [], warnings: [] })),
}));

vi.mock('../zip.js', () => ({
  writeZip: vi.fn(async () => undefined),
}));

// Import after mocks are set up
const { registerExportHandlers } = await import('../ipc/export.js');
const { buildAstroProject }      = await import('@plated/astro-output');
const { generate }               = await import('@plated/generator');
const { writeZip }               = await import('../zip.js');

// ---- Fixtures ---------------------------------------------------------------

let ipc:    FakeIpc;
let dialog: FakeDialog;

beforeEach(() => {
  ipc    = makeIpc();
  dialog = makeDialog();
  vi.clearAllMocks();
  registerExportHandlers(ipc as any, dialog as any);
});

// ---- export:zip -------------------------------------------------------------

describe('export:zip', () => {
  it('returns { ok:false, reason:"cancelled" } when dialog is cancelled', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined });
    const result = await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('returns { ok:true, filePath } on success', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/site.zip' });
    const result = await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    expect(result).toEqual({ ok: true, filePath: '/tmp/site.zip' });
  });

  it('calls buildAstroProject with the schema', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/site.zip' });
    await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    expect(buildAstroProject).toHaveBeenCalledWith(MINIMAL_SCHEMA);
  });

  it('calls writeZip with files and filePath', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/out.zip' });
    await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    expect(writeZip).toHaveBeenCalledWith(
      [{ path: 'index.html', content: '<html/>' }],
      '/tmp/out.zip',
    );
  });

  it('returns { ok:false, reason } when buildAstroProject throws', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/site.zip' });
    vi.mocked(buildAstroProject).mockImplementationOnce(() => { throw new Error('build failed'); });
    const result = await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    expect(result).toMatchObject({ ok: false, reason: 'build failed' });
  });

  it('defaultPath in save dialog uses slugified business name', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true });
    await ipc.invoke('export:zip', MINIMAL_SCHEMA);
    const opts = dialog.showSaveDialog.mock.calls[0][0];
    expect(opts.defaultPath).toBe('the-rusty-fork.zip');
  });

  it('defaultPath falls back to plated-site.zip for empty name', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true });
    const empty = { ...MINIMAL_SCHEMA, business: { ...MINIMAL_SCHEMA.business, name: '' } };
    await ipc.invoke('export:zip', empty);
    const opts = dialog.showSaveDialog.mock.calls[0][0];
    expect(opts.defaultPath).toBe('plated-site.zip');
  });
});

// ---- export:folder ----------------------------------------------------------

describe('export:folder', () => {
  it('returns { ok:false, reason:"cancelled" } when dialog is cancelled', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const result = await ipc.invoke('export:folder', MINIMAL_SCHEMA);
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('returns { ok:true } on success', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/output'] });
    const result: any = await ipc.invoke('export:folder', MINIMAL_SCHEMA);
    expect(result.ok).toBe(true);
    expect(result.filesWritten).toBe(3);
  });

  it('calls generate with outputDir derived from chosen folder + slug', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/output'] });
    await ipc.invoke('export:folder', MINIMAL_SCHEMA);
    const [schema, outDir] = vi.mocked(generate).mock.calls[0];
    expect(schema).toBe(MINIMAL_SCHEMA);
    expect(outDir).toContain('the-rusty-fork');
  });

  it('returns { ok:false } when generate throws', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/output'] });
    vi.mocked(generate).mockRejectedValueOnce(new Error('generate failed'));
    const result: any = await ipc.invoke('export:folder', MINIMAL_SCHEMA);
    expect(result).toMatchObject({ ok: false, reason: 'generate failed' });
  });
});

// ---- export:preview ---------------------------------------------------------

describe('export:preview', () => {
  it('returns { ok:true, filesWritten } on success', async () => {
    const result: any = await ipc.invoke('export:preview', MINIMAL_SCHEMA);
    expect(result.ok).toBe(true);
    expect(result.filesWritten).toBe(3);
  });

  it('calls generate with dryRun:true', async () => {
    await ipc.invoke('export:preview', MINIMAL_SCHEMA);
    const [, , opts] = vi.mocked(generate).mock.calls[0];
    expect(opts).toMatchObject({ dryRun: true });
  });

  it('returns { ok:false } when generate throws', async () => {
    vi.mocked(generate).mockRejectedValueOnce(new Error('dry-run failed'));
    const result: any = await ipc.invoke('export:preview', MINIMAL_SCHEMA);
    expect(result).toMatchObject({ ok: false, reason: 'dry-run failed' });
  });
});
