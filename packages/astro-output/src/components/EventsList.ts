import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildEventsListComponent(schema: ProjectSchema): AstroFile {
  const events = JSON.stringify(schema.events ?? [], null, 2);

  return {
    path: 'src/components/EventsList.astro',
    content: `---
type Event = { id:string; title:string; eventDate:string; description?:string; coverImageUrl?:string; ticketUrl?:string; };
const events: Event[] = ${events};
---
{events.length > 0 && (
  <section class="section block-events">
    <div class="container">
      <h2 class="section-title">Upcoming Events</h2>
      <div class="events-grid">
        {events.map((e) => (
          <div class="event-card">
            {e.coverImageUrl && <img src={e.coverImageUrl} alt={e.title} loading="lazy" />}
            <div class="event-card__body">
              <h3>{e.title}</h3>
              <time>{e.eventDate}</time>
              {e.description && <p>{e.description}</p>}
              {e.ticketUrl && (
                <a class="btn btn-sm" href={e.ticketUrl} target="_blank" rel="noreferrer">Tickets</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

<style>
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(min(100%,300px),1fr));
  gap: var(--space-6,1.5rem);
  margin-top: var(--space-8,2rem);
}
.event-card {
  background: var(--color-bg-surface,var(--color-surface));
  border-radius: var(--radius-lg,0.75rem);
  border: 1px solid var(--color-border);
  overflow: hidden;
}
.event-card img { width:100%; aspect-ratio:16/9; object-fit:cover; }
.event-card__body { padding: var(--space-4,1rem); display:grid; gap:var(--space-2,0.5rem); }
.event-card__body h3 { font-weight:700; }
.event-card__body time { font-size:0.875rem; color:var(--color-text-muted,var(--color-text-secondary)); }
</style>
`,
  };
}
