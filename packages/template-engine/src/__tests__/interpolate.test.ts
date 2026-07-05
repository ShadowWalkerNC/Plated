import { describe, it, expect } from 'vitest';
import { interpolate } from '../interpolate.js';

describe('interpolate', () => {
  it('replaces a simple token', () => {
    expect(interpolate('Hello {{name}}', { name: 'Hearth' })).toBe('Hello Hearth');
  });

  it('replaces multiple distinct tokens', () => {
    const result = interpolate('{{a}} and {{b}}', { a: 'foo', b: 'bar' });
    expect(result).toBe('foo and bar');
  });

  it('replaces the same token appearing twice', () => {
    expect(interpolate('{{x}} {{x}}', { x: 'yes' })).toBe('yes yes');
  });

  it('leaves unknown tokens untouched', () => {
    expect(interpolate('{{unknown}}', {})).toBe('{{unknown}}');
  });

  it('handles nested object paths with dot notation', () => {
    expect(interpolate('{{business.name}}', { 'business.name': 'Vine' })).toBe('Vine');
  });

  it('handles empty string values', () => {
    expect(interpolate('({{empty}})', { empty: '' })).toBe('()');
  });

  it('does not mutate the source string', () => {
    const src = '{{a}}';
    interpolate(src, { a: 'x' });
    expect(src).toBe('{{a}}');
  });

  it('handles template with no tokens', () => {
    expect(interpolate('plain text', { a: 'b' })).toBe('plain text');
  });
});
