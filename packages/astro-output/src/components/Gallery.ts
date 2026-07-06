import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildGalleryComponent(schema: ProjectSchema): AstroFile {
  const images: string[] = [
    schema.branding.heroImageUrl,
    ...((schema as any).gallery ?? []),
  ].filter(Boolean) as string[];

  const items = images.slice(0, 12).map((src) =>
    `      <li class="gallery-item"><img src="${src}" alt="" loading="lazy" /></li>`
  ).join('\n');

  return {
    path: 'src/components/Gallery.astro',
    content: `---
// Gallery.astro
---
${images.length > 0 ? `<section class="section gallery-section">\n  <div class="container">\n    <h2 class="section-title">Gallery</h2>\n    <ul class="gallery-grid">\n${items}\n    </ul>\n  </div>\n</section>` : '<!-- No gallery images configured -->'}

<style>
.gallery-section { background: var(--color-surface); }
.section-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-text); margin-bottom: 2rem; }
.gallery-grid { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
.gallery-item img { width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-card, 1rem); }
</style>
`,
  };
}
