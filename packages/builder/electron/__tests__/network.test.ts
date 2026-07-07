import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, type FakeIpc } from './ipc-harness.js';

// Mock electron before importing handler
vi.mock('electron', () => ({
  net: { isOnline: vi.fn(() => true) },
}));

const { registerNetworkHandlers } = await import('../ipc/network.js');
const { net } = await import('electron');

let ipc: FakeIpc;

beforeEach(() => {
  ipc = makeIpc();
  vi.clearAllMocks();
  registerNetworkHandlers(ipc as any);
});

// ---- network:isOnline -------------------------------------------------------

describe('network:isOnline', () => {
  it('returns true when net.isOnline() is true', async () => {
    vi.mocked(net.isOnline).mockReturnValue(true);
    const result = await ipc.invoke('network:isOnline');
    expect(result).toBe(true);
  });

  it('returns false when net.isOnline() is false', async () => {
    vi.mocked(net.isOnline).mockReturnValue(false);
    const result = await ipc.invoke('network:isOnline');
    expect(result).toBe(false);
  });
});

// ---- network:probe ----------------------------------------------------------

describe('network:probe', () => {
  it('returns { ok:true, status } when fetch resolves with ok:true', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as any;
    const result: any = await ipc.invoke('network:probe', 'https://example.com');
    expect(result).toEqual({ ok: true, status: 200 });
  });

  it('returns { ok:false, status } when fetch resolves with ok:false', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 }) as any;
    const result: any = await ipc.invoke('network:probe', 'https://example.com');
    expect(result).toEqual({ ok: false, status: 503 });
  });

  it('returns { ok:false, status:0 } when fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error')) as any;
    const result: any = await ipc.invoke('network:probe', 'https://example.com');
    expect(result).toEqual({ ok: false, status: 0 });
  });
});
