import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, makeShell, type FakeIpc, type FakeShell } from './ipc-harness.js';

const { registerShellHandlers } = await import('../ipc/shell.js');

let ipc:   FakeIpc;
let shell: FakeShell;

beforeEach(() => {
  ipc   = makeIpc();
  shell = makeShell();
  vi.clearAllMocks();
  registerShellHandlers(ipc as any, shell as any);
});

// ---- shell:openExternal -----------------------------------------------------

describe('shell:openExternal', () => {
  it('calls shell.openExternal for an https URL', async () => {
    await ipc.invoke('shell:openExternal', 'https://example.com');
    expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
  });

  it('calls shell.openExternal for an http URL', async () => {
    await ipc.invoke('shell:openExternal', 'http://localhost:3000');
    expect(shell.openExternal).toHaveBeenCalledWith('http://localhost:3000');
  });

  it('throws for a file:// URL', async () => {
    await expect(
      ipc.invoke('shell:openExternal', 'file:///etc/passwd')
    ).rejects.toThrow('openExternal rejected unsafe URL');
  });

  it('throws for a javascript: URL', async () => {
    await expect(
      ipc.invoke('shell:openExternal', 'javascript:alert(1)')
    ).rejects.toThrow('openExternal rejected unsafe URL');
  });

  it('throws for an empty string', async () => {
    await expect(
      ipc.invoke('shell:openExternal', '')
    ).rejects.toThrow('openExternal rejected unsafe URL');
  });
});

// ---- shell:revealInFinder ---------------------------------------------------

describe('shell:revealInFinder', () => {
  it('calls shell.showItemInFolder with the provided path', async () => {
    await ipc.invoke('shell:revealInFinder', '/Users/me/project.plated');
    expect(shell.showItemInFolder).toHaveBeenCalledWith('/Users/me/project.plated');
  });

  it('calls shell.showItemInFolder even for non-existent paths', async () => {
    await ipc.invoke('shell:revealInFinder', '/does/not/exist.txt');
    expect(shell.showItemInFolder).toHaveBeenCalledWith('/does/not/exist.txt');
  });
});
