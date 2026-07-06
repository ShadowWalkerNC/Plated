import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildContactPage(schema: ProjectSchema): AstroFile {
  const b   = schema.business;
  const loc = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  const addr = loc ? [loc.address1, loc.city, loc.state, loc.zip].filter(Boolean).join(', ') : '';
  const mapUrl = loc?.googleMapsUrl ?? (addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : '');

  return {
    path: 'src/pages/contact.astro',
    content: `---
import Base from '../layouts/Base.astro';
---
<Base title="Contact — ${b.name}">
  <section class="section contact-page">
    <div class="container contact-inner">
      <h1 class="page-title">Contact</h1>
      <div class="contact-grid">
        <div class="contact-details">
          ${b.phone ? `<div class="contact-row"><span class="contact-label">Phone</span><a href="tel:${b.phone}" class="contact-value">${b.phone}</a></div>` : ''}
          ${b.email ? `<div class="contact-row"><span class="contact-label">Email</span><a href="mailto:${b.email}" class="contact-value">${b.email}</a></div>` : ''}
          ${addr    ? `<div class="contact-row"><span class="contact-label">Address</span><address class="contact-value">${addr}</address></div>` : ''}
          ${mapUrl  ? `<a class="btn contact-map-btn" href="${mapUrl}" target="_blank" rel="noreferrer">Open in Maps</a>` : ''}
        </div>
      </div>
    </div>
  </section>
</Base>

<style>
.contact-page { background: var(--color-bg); }
.contact-inner { display: grid; gap: 2rem; max-width: 700px; }
.page-title { font-family: var(--font-display); font-size: clamp(2.5rem,6vw,5rem); font-weight: 700; color: var(--color-text); line-height: 1; }
.contact-grid { display: grid; gap: 1rem; }
.contact-row { display: grid; grid-template-columns: 120px 1fr; gap: 1rem; align-items: baseline; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); }
.contact-label { font-weight: 700; color: var(--color-text); }
.contact-value { color: var(--color-text-muted); font-style: normal; }
.contact-map-btn { justify-self: start; margin-top: 0.5rem; }
</style>
`,
  };
}
