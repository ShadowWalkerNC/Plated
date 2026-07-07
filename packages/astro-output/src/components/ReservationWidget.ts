import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildReservationComponent(schema: ProjectSchema): AstroFile {
  const res      = schema.extensions?.reservations;
  const widgetUrl = res?.widgetUrl ?? '';
  const provider  = res?.provider  ?? '';

  return {
    path: 'src/components/ReservationWidget.astro',
    content: `---
const widgetUrl = ${JSON.stringify(widgetUrl)};
const provider  = ${JSON.stringify(provider)};
---
{widgetUrl && (
  <section class="section block-reservation">
    <div class="container">
      <h2 class="section-title">Make a Reservation</h2>
      {provider && <p class="reservation-provider">Powered by {provider}</p>}
      <iframe
        src={widgetUrl}
        title="Reservation widget"
        width="100%"
        height="540"
        style="border:none;border-radius:var(--radius-lg,0.75rem)"
        loading="lazy"
      ></iframe>
    </div>
  </section>
)}

<style>
.reservation-provider {
  font-size: 0.8rem;
  text-transform: capitalize;
  color: var(--color-text-muted, var(--color-text-secondary));
  margin-bottom: var(--space-4, 1rem);
}
</style>
`,
  };
}
