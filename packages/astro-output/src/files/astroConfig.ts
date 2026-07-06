import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildAstroConfig(schema: ProjectSchema): AstroFile {
  const subdomain = (schema as any).deployment?.subdomain ?? 'example';
  const siteUrl   = `https://${subdomain}.nexcms.io`;
  return {
    path: 'astro.config.mjs',
    content: `import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: '${siteUrl}',
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
`,
  };
}
