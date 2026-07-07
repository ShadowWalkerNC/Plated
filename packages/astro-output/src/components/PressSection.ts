import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildPressSectionComponent(schema: ProjectSchema): AstroFile {
  const items = JSON.stringify(schema.press ?? [], null, 2);

  return {
    path: 'src/components/PressSection.astro',
    content: `---
type PressItem = { id:string; publication:string; headline:string; url?:string; logoUrl?:string; publishedAt?:string; };
const items: PressItem[] = ${items};
---
{items.length > 0 && (
  <section class="section block-press">
    <div class="container">
      <h2 class="section-title">As Seen In</h2>
      <div class="press-grid">
        {items.map((p) => (
          <a
            class="press-item"
            href={p.url ?? '#'}
            target="_blank"
            rel="noreferrer"
            aria-label={p.publication}
          >
            {p.logoUrl
              ? <img src={p.logoUrl} alt={p.publication} loading="lazy" />
              : <span class="press-item__name">{p.publication}</span>
            }
            {p.headline && <span class="press-item__headline">{p.headline}</span>}
          </a>
        ))}
      </div>
    </div>
  </section>
)}

<style>
.press-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-8,2rem);
  margin-top: var(--space-8,2rem);
}
.press-item {
  display: grid;
  gap: var(--space-2,0.5rem);
  place-items: center;
  opacity: 0.7;
  transition: opacity 150ms;
}
.press-item:hover { opacity: 1; }
.press-item img { max-height: 48px; width: auto; object-fit: contain; }
.press-item__name { font-weight: 700; font-size: 1.1rem; }
.press-item__headline { font-size: 0.8rem; color: var(--color-text-muted); max-width: 24ch; text-align:center; }
</style>
`,
  };
}
