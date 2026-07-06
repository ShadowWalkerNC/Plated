import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildMenuPage(schema: ProjectSchema): AstroFile {
  return {
    path: 'src/pages/menu.astro',
    content: `---
import Base        from '../layouts/Base.astro';
import MenuSection from '../components/MenuSection.astro';
---
<Base title="Menu — ${schema.business.name}">
  <div class="menu-page-hero">
    <div class="container">
      <h1 class="page-title">Menu</h1>
    </div>
  </div>
  <MenuSection />
</Base>

<style>
.menu-page-hero {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding-block: 3rem;
}
.page-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}
</style>
`,
  };
}
