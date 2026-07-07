import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join }   from 'node:path';
import { makeIpc, MINIMAL_SCHEMA, type FakeIpc } from './ipc-harness.js';

// project.ts uses real fs — we test against the real filesystem in a tmp dir
// to keep the tests honest about JSON round-trips.
import { writeFile, readFile, rm } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';

const { registerProjectHandlers } = await import('../ipc/project.js');

let ipc:    FakeIpc;
let tmpDir: string;

beforeEach(async () => {
  ipc    = makeIpc();
  tmpDir = await mkdtemp(join(tmpdir(), 'plated-ipc-test-'));
  // Fresh handler registration so recentProjects state is reset per-test.
  // (module-level array in project.ts persists; we just test relative order)
  registerProjectHandlers(ipc as any);
});

aftereachAsync: // vitest afterEach
const { afterEach } = await import('vitest');
afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

// ---- project:save -----------------------------------------------------------

describe('project:save', () => {
  it('writes JSON to the specified filePath', async () => {
    const filePath = join(tmpDir, 'project.plated');
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath });
    const raw = await readFile(filePath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('written JSON round-trips to original schema', async () => {
    const filePath = join(tmpDir, 'project.plated');
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath });
    const raw    = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.id).toBe(MINIMAL_SCHEMA.id);
    expect(parsed.business.name).toBe('The Rusty Fork');
  });
});

// ---- project:load -----------------------------------------------------------

describe('project:load', () => {
  it('reads and parses a JSON project file', async () => {
    const filePath = join(tmpDir, 'project.plated');
    await writeFile(filePath, JSON.stringify(MINIMAL_SCHEMA), 'utf-8');
    const result: any = await ipc.invoke('project:load', { filePath });
    expect(result.id).toBe(MINIMAL_SCHEMA.id);
    expect(result.business.name).toBe('The Rusty Fork');
  });
});

// ---- project:recent ---------------------------------------------------------

describe('project:recent', () => {
  it('returns an array', async () => {
    const result = await ipc.invoke('project:recent');
    expect(Array.isArray(result)).toBe(true);
  });

  it('MRU: most recently saved path appears first', async () => {
    const a = join(tmpDir, 'a.plated');
    const b = join(tmpDir, 'b.plated');
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath: a });
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath: b });
    const recent: any = await ipc.invoke('project:recent');
    expect(recent[0]).toBe(b);
    expect(recent[1]).toBe(a);
  });

  it('deduplicates: saving same path moves it to front', async () => {
    const a = join(tmpDir, 'a.plated');
    const b = join(tmpDir, 'b.plated');
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath: a });
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath: b });
    await ipc.invoke('project:save', { schema: MINIMAL_SCHEMA, filePath: a });
    const recent: any = await ipc.invoke('project:recent');
    expect(recent[0]).toBe(a);
    // a should appear only once
    expect(recent.filter((p: string) => p === a)).toHaveLength(1);
  });
});
