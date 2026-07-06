import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildAstroConfig(schema: ProjectSchema): AstroFile {
  const subdomain   = schema.deployment?.subdomain ?? 'example';
  const customDomain = schema.deployment?.customDomain;
  const siteUrl     = customDomain ? `https://${customDomain}` : `https://${subdomain}.plated.app`;
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
