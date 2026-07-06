import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildRobotsTxt(schema: ProjectSchema): AstroFile {
  const subdomain = (schema as any).deployment?.subdomain ?? 'example';
  return {
    path: 'public/robots.txt',
    content: `User-agent: *\nAllow: /\nSitemap: https://${subdomain}.nexcms.io/sitemap-index.xml\n`,
  };
}
