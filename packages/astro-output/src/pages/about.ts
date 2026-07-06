import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildAboutPage(schema: ProjectSchema): AstroFile {
  const b = schema.business;
  return {
    path: 'src/pages/about.astro',
    content: `---
import Base from '../layouts/Base.astro';
---
<Base title="About — ${b.name}">
  <section class="section about-page">
    <div class="container about-inner">
      <h1 class="page-title">About Us</h1>
      ${b.description ? `<p class="about-desc">${b.description}</p>` : ''}
      ${b.foundedYear ? `<p class="about-founded">Founded in ${b.foundedYear}.</p>` : ''}
      ${b.cuisineType ? `<p class="about-cuisine">Cuisine: <strong>${b.cuisineType}</strong></p>` : ''}
    </div>
  </section>
</Base>

<style>
.about-page { background: var(--color-bg); }
.about-inner { display: grid; gap: 1.25rem; max-width: 680px; }
.page-title { font-family: var(--font-display); font-size: clamp(2.5rem,6vw,5rem); font-weight: 700; color: var(--color-text); line-height: 1; }
.about-desc { color: var(--color-text-muted); font-size: 1.1rem; line-height: 1.75; }
.about-founded, .about-cuisine { color: var(--color-text-muted); }
</style>
`,
  };
}
