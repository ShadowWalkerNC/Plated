import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildSocialComponent(schema: ProjectSchema): AstroFile {
  const s = schema.social;
  const delivery: [string, string | undefined][] = [
    ['DoorDash', s.doordash], ['Uber Eats', s.ubereats],
    ['Grubhub', s.grubhub],   ['Toast', s.toast],
    ['ChowNow', s.chownow],
  ];
  const active = delivery.filter(([, u]) => Boolean(u));
  const links = active.map(([label, url]) =>
    `  <a class="delivery-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`
  ).join('\n');

  return {
    path: 'src/components/SocialLinks.astro',
    content: `---
// SocialLinks.astro — delivery & ordering links
---
${active.length ? `<section class="section order-section">\n  <div class="container order-inner">\n    <h2 class="section-title">Order Online</h2>\n    <div class="delivery-links">\n${links}\n    </div>\n  </div>\n</section>` : '<!-- No delivery links configured -->'}

<style>
.order-section { background: var(--color-bg); }
.order-inner { display: grid; gap: 2rem; }
.section-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-text); }
.delivery-links { display: flex; gap: 1rem; flex-wrap: wrap; }
.delivery-link { display: inline-flex; align-items: center; min-height: 48px; padding: 0.75rem 1.5rem; border-radius: var(--radius-btn, 0.5rem); border: 1.5px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-weight: 700; transition: border-color 120ms; }
.delivery-link:hover { border-color: var(--color-primary); color: var(--color-primary); }
</style>
`,
  };
}
