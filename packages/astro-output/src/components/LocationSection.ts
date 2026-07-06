import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

export function buildLocationComponent(schema: ProjectSchema): AstroFile {
  const loc = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  const addr = loc ? [loc.address1, loc.address2, loc.city, loc.state, loc.zip].filter(Boolean).join(', ') : '';
  const mapUrl = loc?.googleMapsUrl ?? (addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : '');

  return {
    path: 'src/components/LocationSection.astro',
    content: `---
// LocationSection.astro
---
<section class="section location-section">
  <div class="container location-inner">
    <h2 class="section-title">Find Us</h2>
    ${addr ? `<address class="location-addr">${addr}</address>` : ''}
    ${mapUrl ? `<a class="btn location-map-btn" href="${mapUrl}" target="_blank" rel="noreferrer">View on Google Maps</a>` : ''}
  </div>
</section>

<style>
.location-section { background: var(--color-surface); }
.location-inner { display: grid; gap: 1.5rem; max-width: 600px; }
.section-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-text); }
.location-addr { font-style: normal; color: var(--color-text-muted); font-size: 1.05rem; line-height: 1.6; }
.location-map-btn { justify-self: start; }
</style>
`,
  };
}
