import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildRobotsTxt(schema: ProjectSchema): AstroFile {
  const subdomain    = schema.deployment?.subdomain ?? 'example';
  const customDomain = schema.deployment?.customDomain;
  const host         = customDomain ? customDomain : `${subdomain}.plated.app`;
  return {
    path: 'public/robots.txt',
    content: `User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap-index.xml\n`,
  };
}
