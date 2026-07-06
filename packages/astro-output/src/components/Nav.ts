import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildNavComponent(schema: ProjectSchema): AstroFile {
  const name = schema.business.name;
  const logo = schema.branding.logoUrl;
  const links = [
    { label: 'Menu',    href: '/menu'    },
    { label: 'About',   href: '/about'   },
    { label: 'Contact', href: '/contact' },
  ];
  const linksHtml = links.map((l) =>
    `    <li><a href="${l.href}">${l.label}</a></li>`
  ).join('\n');

  return {
    path: 'src/components/Nav.astro',
    content: `---
// Nav.astro
---
<header class="nav">
  <div class="nav__inner">
    <a href="/" class="nav__brand">
      ${logo ? `<img src="${logo}" alt="${name} logo" height="40" />` : name}
    </a>
    <nav aria-label="Main navigation">
      <ul class="nav__links">
${linksHtml}
      </ul>
    </nav>
  </div>
</header>

<style>
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(var(--color-bg-rgb, 255 255 255) / 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.nav__inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 64px; padding-inline: 1.5rem;
  max-width: 1200px; margin-inline: auto;
}
.nav__brand {
  font-family: var(--font-display);
  font-size: 1.25rem; font-weight: 700;
  color: var(--color-text);
}
.nav__links {
  display: flex; gap: 2rem; list-style: none;
}
.nav__links a {
  font-size: 0.95rem; font-weight: 500;
  color: var(--color-text-muted);
  transition: color 120ms;
}
.nav__links a:hover { color: var(--color-text); }
</style>
`,
  };
}
