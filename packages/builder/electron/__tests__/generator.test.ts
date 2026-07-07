import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeIpc, MINIMAL_SCHEMA, type FakeIpc } from './ipc-harness.js';

vi.mock('@plated/generator', () => ({
  generate: vi.fn(async () => ({ success: true, filesWritten: 5, errors: [], warnings: [] })),
}));

const { registerGeneratorHandlers } = await import('../ipc/generator.js');
const { generate }                  = await import('@plated/generator');

let ipc: FakeIpc;

beforeEach(() => {
  ipc = makeIpc();
  vi.clearAllMocks();
  registerGeneratorHandlers(ipc as any);
});

// ---- generate ---------------------------------------------------------------

describe('generate', () => {
  it('calls generate() with the provided schema and outputDir', async () => {
    await ipc.invoke('generate', { schema: MINIMAL_SCHEMA, outputDir: '/out/dir' });
    expect(generate).toHaveBeenCalledWith(MINIMAL_SCHEMA, '/out/dir');
  });

  it('returns the generate() result', async () => {
    const result: any = await ipc.invoke('generate', { schema: MINIMAL_SCHEMA, outputDir: '/out/dir' });
    expect(result.success).toBe(true);
    expect(result.filesWritten).toBe(5);
  });
});

// ---- generate:dryRun --------------------------------------------------------

describe('generate:dryRun', () => {
  it('calls generate() with dryRun:true', async () => {
    await ipc.invoke('generate:dryRun', { schema: MINIMAL_SCHEMA });
    const [, , opts] = vi.mocked(generate).mock.calls[0];
    expect(opts).toMatchObject({ dryRun: true });
  });

  it('returns the generate() result', async () => {
    const result: any = await ipc.invoke('generate:dryRun', { schema: MINIMAL_SCHEMA });
    expect(result.success).toBe(true);
  });
});
