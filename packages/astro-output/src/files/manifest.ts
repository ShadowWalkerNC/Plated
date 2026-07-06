import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildSiteManifest(schema: ProjectSchema): AstroFile {
  return {
    path: 'public/manifest.webmanifest',
    content: JSON.stringify({
      name:             schema.business.name,
      short_name:       schema.business.name,
      start_url:        '/',
      display:          'standalone',
      background_color: schema.branding.secondaryColor ?? '#ffffff',
      theme_color:      schema.branding.primaryColor   ?? '#7a3b1d',
      icons: schema.branding.faviconSourceUrl ? [{
        src: schema.branding.faviconSourceUrl,
        sizes: '192x192',
        type: 'image/png',
      }] : [],
    }, null, 2) + '\n',
  };
}
