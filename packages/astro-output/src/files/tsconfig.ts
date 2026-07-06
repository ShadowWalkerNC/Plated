import type { AstroFile } from '../types.js';

export function buildTsConfig(): AstroFile {
  return {
    path: 'tsconfig.json',
    content: JSON.stringify({ extends: 'astro/tsconfigs/strictest' }, null, 2) + '\n',
  };
}
