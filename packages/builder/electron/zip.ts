import { writeFile, mkdir } from 'node:fs/promises';
import { dirname }          from 'node:path';
import type { AstroFile }   from '@nexcms/astro-output';

// Spec-compliant ZIP builder — no external deps.
// Compression method: 0 (stored). Files are written verbatim.

const CRC32_TABLE = makeCrc32Table();

function makeCrc32Table(): Uint32Array {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC32_TABLE[(crc ^ data[i]) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function str(s: string): Uint8Array { return new TextEncoder().encode(s); }

function u16le(v: number): Uint8Array { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, v, true); return b; }
function u32le(v: number): Uint8Array { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, v, true); return b; }

function concat(...bufs: Uint8Array[]): Uint8Array {
  const total = bufs.reduce((n, b) => n + b.length, 0);
  const out   = new Uint8Array(total);
  let off = 0;
  for (const b of bufs) { out.set(b, off); off += b.length; }
  return out;
}

interface Entry {
  localHeader: Uint8Array;
  data:        Uint8Array;
  centralDir:  Uint8Array;
  offset:      number;
}

export async function writeZip(files: AstroFile[], destPath: string): Promise<void> {
  const enc     = new TextEncoder();
  const entries: Entry[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = str(file.path);
    const dataBytes = enc.encode(file.content);
    const crc       = crc32(dataBytes);
    const size      = dataBytes.length;

    // Local file header (signature 0x04034b50)
    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16le(20),        // version needed
      u16le(0),         // flags
      u16le(0),         // compression (stored)
      u16le(0),         // mod time
      u16le(0),         // mod date
      u32le(crc),
      u32le(size),      // compressed size
      u32le(size),      // uncompressed size
      u16le(nameBytes.length),
      u16le(0),         // extra field length
      nameBytes,
    );

    // Central directory entry (signature 0x02014b50)
    const central = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16le(20),        // version made by
      u16le(20),        // version needed
      u16le(0),         // flags
      u16le(0),         // compression
      u16le(0),         // mod time
      u16le(0),         // mod date
      u32le(crc),
      u32le(size),
      u32le(size),
      u16le(nameBytes.length),
      u16le(0),         // extra
      u16le(0),         // comment
      u16le(0),         // disk start
      u16le(0),         // int attrs
      u32le(0),         // ext attrs
      u32le(offset),    // relative offset of local header
      nameBytes,
    );

    entries.push({ localHeader: local, data: dataBytes, centralDir: central, offset });
    offset += local.length + dataBytes.length;
  }

  const centralDirOffset = offset;
  const centralDirSize   = entries.reduce((n, e) => n + e.centralDir.length, 0);

  // End of central directory (EOCD) record
  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16le(0),                      // disk number
    u16le(0),                      // disk with CD start
    u16le(entries.length),         // entries on this disk
    u16le(entries.length),         // total entries
    u32le(centralDirSize),
    u32le(centralDirOffset),
    u16le(0),                      // comment length
  );

  const parts: Uint8Array[] = [];
  for (const e of entries) { parts.push(e.localHeader, e.data); }
  for (const e of entries) { parts.push(e.centralDir); }
  parts.push(eocd);

  const zipBytes = concat(...parts);
  await mkdir(dirname(destPath), { recursive: true });
  await writeFile(destPath, zipBytes);
}
