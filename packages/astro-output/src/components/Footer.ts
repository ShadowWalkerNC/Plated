import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildFooterComponent(schema: ProjectSchema): AstroFile {
  const name   = schema.business.name;
  const year   = new Date().getFullYear();
  const loc    = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  const addr   = loc ? [loc.address1, loc.city, loc.state].filter(Boolean).join(', ') : '';
  const phone  = schema.business.phone;
  const email  = schema.business.email;
  const ig     = schema.social.instagram;
  const fb     = schema.social.facebook;

  const socialLinks = [
    ig && `<a href="${ig}" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>`,
    fb && `<a href="${fb}" target="_blank" rel="noreferrer" aria-label="Facebook">FB</a>`,
  ].filter(Boolean).join('\n      ');

  return {
    path: 'src/components/Footer.astro',
    content: `---
// Footer.astro
---
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <div class="footer__name">${name}</div>
      ${addr  ? `<address class="footer__addr">${addr}</address>` : ''}
      ${phone ? `<a class="footer__contact" href="tel:${phone}">${phone}</a>` : ''}
      ${email ? `<a class="footer__contact" href="mailto:${email}">${email}</a>` : ''}
    </div>
    ${socialLinks ? `<div class="footer__social">${socialLinks}</div>` : ''}
    <div class="footer__copy">&copy; {${year}} ${name}. Site by <a href="https://plated.app">Plated</a>.</div>
  </div>
</footer>

<style>
.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-block: 3rem;
}
.footer__inner {
  max-width: 1200px; margin-inline: auto; padding-inline: 1.5rem;
  display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: start;
}
.footer__name { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--color-text); }
.footer__addr { font-style: normal; color: var(--color-text-muted); margin-top: 0.5rem; font-size: 0.9rem; }
.footer__contact { display: block; color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
.footer__social { display: flex; gap: 1rem; align-items: flex-start; }
.footer__social a { color: var(--color-text-muted); font-weight: 700; font-size: 0.85rem; }
.footer__copy { grid-column: 1 / -1; color: var(--color-text-muted); font-size: 0.82rem; border-top: 1px solid var(--color-border); padding-top: 1.25rem; margin-top: 0.5rem; }
</style>
`,
  };
}
