import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProject } from '@/lib/db/queries';
import { apiRatelimit } from '@/lib/ratelimit';
import { generate } from '@plated/generator';
import { tmpdir } from 'node:os';
import { mkdtemp, rm, readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

interface Ctx { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await apiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const project = await getProject(params.id, userId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let tmpDir: string | null = null;
  try {
    tmpDir = await mkdtemp(join(tmpdir(), 'plated-zip-'));
    const result = await generate(project.schema, tmpDir);
    if (!result.success) {
      return NextResponse.json({ error: 'Build failed', errors: result.errors }, { status: 500 });
    }

    const zipBytes = await buildZip(tmpDir);

    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.slug || project.id}.zip"`,
        'Content-Length': String(zipBytes.byteLength),
      },
    });
  } finally {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── Minimal ZIP builder (no external deps) ──────────────────────────────────────────
async function buildZip(dir: string): Promise<ArrayBuffer> {
  const entries: Array<{ name: string; data: Uint8Array }> = [];

  async function walk(current: string) {
    const items = await readdir(current, { withFileTypes: true });
    for (const item of items) {
      const full = join(current, item.name);
      if (item.isDirectory()) {
        await walk(full);
      } else {
        const rel  = relative(dir, full).replace(/\\/g, '/');
        const data = await readFile(full);
        entries.push({ name: rel, data: new Uint8Array(data) });
      }
    }
  }

  await walk(dir);

  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const local = buildLocalFileHeader(nameBytes, entry.data, offset);
    parts.push(local.header);
    parts.push(entry.data);
    centralDir.push(buildCentralDirEntry(nameBytes, entry.data, offset, local.crc));
    offset += local.header.length + entry.data.length;
  }

  const centralDirBytes = concat(centralDir);
  const eocd = buildEOCD(entries.length, centralDirBytes.length, offset);
  return concat([...parts, centralDirBytes, eocd]).buffer;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  const table = crc32Table();
  for (const byte of data) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff]!;
  return (crc ^ 0xffffffff) >>> 0;
}

let _table: Uint32Array | null = null;
function crc32Table(): Uint32Array {
  if (_table) return _table;
  _table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    _table[i] = c;
  }
  return _table;
}

function writeU16LE(v: number, buf: DataView, off: number) { buf.setUint16(off, v, true); }
function writeU32LE(v: number, buf: DataView, off: number) { buf.setUint32(off, v, true); }

function buildLocalFileHeader(name: Uint8Array, data: Uint8Array, _offset: number) {
  const crc    = crc32(data);
  const buf    = new ArrayBuffer(30 + name.length);
  const view   = new DataView(buf);
  writeU32LE(0x04034b50, view, 0);
  writeU16LE(20, view, 4);
  writeU16LE(0, view, 6);
  writeU16LE(0, view, 8);
  writeU16LE(0, view, 10);
  writeU16LE(0, view, 12);
  writeU32LE(crc, view, 14);
  writeU32LE(data.length, view, 18);
  writeU32LE(data.length, view, 22);
  writeU16LE(name.length, view, 26);
  writeU16LE(0, view, 28);
  new Uint8Array(buf).set(name, 30);
  return { header: new Uint8Array(buf), crc };
}

function buildCentralDirEntry(name: Uint8Array, data: Uint8Array, offset: number, crc: number) {
  const buf  = new ArrayBuffer(46 + name.length);
  const view = new DataView(buf);
  writeU32LE(0x02014b50, view, 0);
  writeU16LE(20, view, 4);
  writeU16LE(20, view, 6);
  writeU16LE(0, view, 8);
  writeU16LE(0, view, 10);
  writeU16LE(0, view, 12);
  writeU16LE(0, view, 14);
  writeU32LE(crc, view, 16);
  writeU32LE(data.length, view, 20);
  writeU32LE(data.length, view, 24);
  writeU16LE(name.length, view, 28);
  writeU16LE(0, view, 30);
  writeU16LE(0, view, 32);
  writeU16LE(0, view, 34);
  writeU16LE(0, view, 36);
  writeU32LE(0, view, 38);
  writeU32LE(offset, view, 42);
  new Uint8Array(buf).set(name, 46);
  return new Uint8Array(buf);
}

function buildEOCD(count: number, cdSize: number, cdOffset: number) {
  const buf  = new ArrayBuffer(22);
  const view = new DataView(buf);
  writeU32LE(0x06054b50, view, 0);
  writeU16LE(0, view, 4);
  writeU16LE(0, view, 6);
  writeU16LE(count, view, 8);
  writeU16LE(count, view, 10);
  writeU32LE(cdSize, view, 12);
  writeU32LE(cdOffset, view, 16);
  writeU16LE(0, view, 20);
  return new Uint8Array(buf);
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total  = arrays.reduce((n, a) => n + a.length, 0);
  const result = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { result.set(a, off); off += a.length; }
  return result;
}
