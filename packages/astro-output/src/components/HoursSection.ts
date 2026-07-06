import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function buildHoursComponent(schema: ProjectSchema): AstroFile {
  const loc  = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  const rows = loc?.hours?.schedule?.map((d) =>
    `  <tr><th>${DAYS[d.day] ?? 'Day'}</th><td>${d.open ? `${d.openTime ?? ''}\u2013${d.closeTime ?? ''}` : 'Closed'}</td></tr>`
  ).join('\n') ?? '';

  return {
    path: 'src/components/HoursSection.astro',
    content: `---
// HoursSection.astro
---
<section class="section hours-section">
  <div class="container hours-inner">
    <h2 class="section-title">Hours</h2>
    ${rows ? `<table class="hours-table">\n  <tbody>\n${rows}\n  </tbody>\n</table>` : '<p>Please call for current hours.</p>'}
  </div>
</section>

<style>
.hours-section { background: var(--color-bg); }
.hours-inner { display: grid; gap: 2rem; max-width: 520px; }
.section-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-text); }
.hours-table { width: 100%; border-collapse: collapse; }
.hours-table th, .hours-table td { padding: 0.65rem 0; border-bottom: 1px solid var(--color-border); text-align: left; color: var(--color-text); }
.hours-table th { font-weight: 700; width: 50%; }
.hours-table td { color: var(--color-text-muted); }
</style>
`,
  };
}
