import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, type FakeIpc } from './ipc-harness.js';

// Mock electron (app.getVersion)
vi.mock('electron', () => ({
  app: { getVersion: vi.fn(() => '1.2.3') },
  net: { isOnline: vi.fn(() => true) },
}));

const { registerUpdateHandlers } = await import('../ipc/updater.js');

const makeUpdater = () => ({
  checkForUpdates:  vi.fn(async () => ({ updateInfo: { version: '2.0.0' } })),
  quitAndInstall:   vi.fn(),
});

let ipc: FakeIpc;
let updater: ReturnType<typeof makeUpdater>;

beforeEach(() => {
  ipc     = makeIpc();
  updater = makeUpdater();
  vi.clearAllMocks();
  registerUpdateHandlers(ipc as any, updater as any, null);
});

// ---- updater:check ----------------------------------------------------------

describe('updater:check', () => {
  it('returns { ok:true, updateInfo } on success', async () => {
    const result: any = await ipc.invoke('updater:check');
    expect(result.ok).toBe(true);
    expect(result.updateInfo.version).toBe('2.0.0');
  });

  it('returns { ok:true, updateInfo:null } when checkForUpdates returns null', async () => {
    updater.checkForUpdates.mockResolvedValueOnce(null);
    const result: any = await ipc.invoke('updater:check');
    expect(result).toEqual({ ok: true, updateInfo: null });
  });

  it('returns { ok:false, error } when checkForUpdates throws', async () => {
    updater.checkForUpdates.mockRejectedValueOnce(new Error('update server down'));
    const result: any = await ipc.invoke('updater:check');
    expect(result).toMatchObject({ ok: false, error: 'update server down' });
  });
});

// ---- updater:install --------------------------------------------------------

describe('updater:install', () => {
  it('calls quitAndInstall(false, true)', async () => {
    await ipc.invoke('updater:install');
    expect(updater.quitAndInstall).toHaveBeenCalledWith(false, true);
  });
});

// ---- updater:version --------------------------------------------------------

describe('updater:version', () => {
  it('returns the app version string', async () => {
    const result = await ipc.invoke('updater:version');
    expect(result).toBe('1.2.3');
  });
});
