import { describe, it, expect } from 'vitest';
import { generateQrDataUrl, generateQrBuffer } from '../qr.js';

const TEST_URL = 'https://rustyfork.plated.app';
const ALT_URL  = 'https://demo.plated.app/menu';

// ---------------------------------------------------------------------------
// generateQrDataUrl
// ---------------------------------------------------------------------------

describe('generateQrDataUrl', () => {
  it('returns a string', async () => {
    const result = await generateQrDataUrl(TEST_URL);
    expect(result).toBeTypeOf('string');
  });

  it('starts with the PNG data URL prefix', async () => {
    const result = await generateQrDataUrl(TEST_URL);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('returns a non-trivially long base64 string', async () => {
    const result = await generateQrDataUrl(TEST_URL);
    // A 400×400 PNG encodes to thousands of base64 chars
    expect(result.length).toBeGreaterThan(1000);
  });

  it('different URLs produce different data URLs', async () => {
    const a = await generateQrDataUrl(TEST_URL);
    const b = await generateQrDataUrl(ALT_URL);
    expect(a).not.toBe(b);
  });

  it('accepts a custom size option without error', async () => {
    await expect(
      generateQrDataUrl(TEST_URL, { size: 200 })
    ).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it('accepts error correction level H without error', async () => {
    await expect(
      generateQrDataUrl(TEST_URL, { errorCorrectionLevel: 'H' })
    ).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it('accepts all four error correction levels', async () => {
    for (const level of ['L', 'M', 'Q', 'H'] as const) {
      await expect(
        generateQrDataUrl(TEST_URL, { errorCorrectionLevel: level })
      ).resolves.toBeTypeOf('string');
    }
  });

  it('accepts custom dark and light color options', async () => {
    await expect(
      generateQrDataUrl(TEST_URL, { darkColor: '#000000', lightColor: '#ffffff' })
    ).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it('accepts a custom margin', async () => {
    await expect(
      generateQrDataUrl(TEST_URL, { margin: 4 })
    ).resolves.toBeTypeOf('string');
  });
});

// ---------------------------------------------------------------------------
// generateQrBuffer
// ---------------------------------------------------------------------------

describe('generateQrBuffer', () => {
  it('returns a Uint8Array', async () => {
    const result = await generateQrBuffer(TEST_URL);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('buffer starts with PNG magic bytes', async () => {
    const result = await generateQrBuffer(TEST_URL);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(result[0]).toBe(0x89);
    expect(result[1]).toBe(0x50); // 'P'
    expect(result[2]).toBe(0x4e); // 'N'
    expect(result[3]).toBe(0x47); // 'G'
  });

  it('returns a non-empty buffer', async () => {
    const result = await generateQrBuffer(TEST_URL);
    expect(result.length).toBeGreaterThan(0);
  });

  it('different URLs produce different buffers', async () => {
    const a = await generateQrBuffer(TEST_URL);
    const b = await generateQrBuffer(ALT_URL);
    // Compare first 64 bytes as a proxy — full compare is slow
    expect(Buffer.from(a.slice(0, 64)).toString('hex'))
      .not.toBe(Buffer.from(b.slice(0, 64)).toString('hex'));
  });

  it('accepts a custom size option without error', async () => {
    const result = await generateQrBuffer(TEST_URL, { size: 300 });
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('accepts a custom dark color without error', async () => {
    const result = await generateQrBuffer(TEST_URL, { darkColor: '#2d6a4f' });
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('buffer size varies with QR size option', async () => {
    const small = await generateQrBuffer(TEST_URL, { size: 100 });
    const large = await generateQrBuffer(TEST_URL, { size: 800 });
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('error correction H produces a valid PNG buffer', async () => {
    const result = await generateQrBuffer(TEST_URL, { errorCorrectionLevel: 'H' });
    expect(result[0]).toBe(0x89);
    expect(result.length).toBeGreaterThan(0);
  });
};
