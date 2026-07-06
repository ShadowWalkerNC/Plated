import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildPackageJson(schema: ProjectSchema): AstroFile {
  const name = (schema.business.name || 'plated-site')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'plated-site';

  return {
    path: 'package.json',
    content: JSON.stringify({
      name,
      private: true,
      type: 'module',
      scripts: {
        dev:     'astro dev',
        build:   'astro build',
        preview: 'astro preview',
      },
      dependencies: {
        astro: '^5.0.0',
        '@astrojs/sitemap': '^3.0.0',
      },
    }, null, 2) + '\n',
  };
}
