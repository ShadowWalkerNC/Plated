import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, makeDialog, type FakeIpc, type FakeDialog } from './ipc-harness.js';

const { registerDialogHandlers } = await import('../ipc/dialog.js');

let ipc:    FakeIpc;
let dialog: FakeDialog;

beforeEach(() => {
  ipc    = makeIpc();
  dialog = makeDialog();
  vi.clearAllMocks();
  registerDialogHandlers(ipc as any, dialog as any);
});

// ---- dialog:pickOutputDir ---------------------------------------------------

describe('dialog:pickOutputDir', () => {
  it('returns null when cancelled', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const result = await ipc.invoke('dialog:pickOutputDir');
    expect(result).toBeNull();
  });

  it('returns filePaths[0] when a folder is selected', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/chosen/dir'] });
    const result = await ipc.invoke('dialog:pickOutputDir');
    expect(result).toBe('/chosen/dir');
  });

  it('passes openDirectory + createDirectory properties', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    await ipc.invoke('dialog:pickOutputDir');
    const opts = dialog.showOpenDialog.mock.calls[0][0];
    expect(opts.properties).toContain('openDirectory');
    expect(opts.properties).toContain('createDirectory');
  });
});

// ---- dialog:pickFile --------------------------------------------------------

describe('dialog:pickFile', () => {
  it('returns null when cancelled', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const result = await ipc.invoke('dialog:pickFile', undefined);
    expect(result).toBeNull();
  });

  it('returns filePaths[0] when a file is selected', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/path/to/file.plated'] });
    const result = await ipc.invoke('dialog:pickFile', undefined);
    expect(result).toBe('/path/to/file.plated');
  });

  it('passes filters through to showOpenDialog', async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const filters = [{ name: 'Plated Project', extensions: ['plated'] }];
    await ipc.invoke('dialog:pickFile', { filters });
    const opts = dialog.showOpenDialog.mock.calls[0][0];
    expect(opts.filters).toEqual(filters);
  });
});

// ---- dialog:saveFile --------------------------------------------------------

describe('dialog:saveFile', () => {
  it('returns null when cancelled', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined });
    const result = await ipc.invoke('dialog:saveFile', undefined);
    expect(result).toBeNull();
  });

  it('returns filePath when confirmed', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/save/here.pdf' });
    const result = await ipc.invoke('dialog:saveFile', undefined);
    expect(result).toBe('/save/here.pdf');
  });

  it('passes defaultPath and filters through to showSaveDialog', async () => {
    dialog.showSaveDialog.mockResolvedValue({ canceled: true });
    const options = { defaultPath: 'my-file.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] };
    await ipc.invoke('dialog:saveFile', options);
    const opts = dialog.showSaveDialog.mock.calls[0][0];
    expect(opts.defaultPath).toBe('my-file.pdf');
    expect(opts.filters).toEqual(options.filters);
  });
});
