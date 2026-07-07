import type { ProjectSchema, SpecialPost } from '@plated/types';
import type { AstroFile }               from '../types.js';

export function buildSpecialsComponent(schema: ProjectSchema): AstroFile {
  const activeSpecials = (schema.specials ?? []).filter((s) => s.active);

  // Pre-bake specials as a JSON literal so the .astro file is static
  const json = JSON.stringify(activeSpecials, null, 2);

  return {
    path: 'src/components/Specials.astro',
    content: `---
type Special = { id:string; title:string; description?:string; imageUrl?:string; price?:string; active:boolean; createdAt:string; };
const specials: Special[] = ${json};
---
{specials.length > 0 && (
  <section class="section block-specials">
    <div class="container">
      <h2 class="section-title">Today's Specials</h2>
      <div class="specials-grid">
        {specials.map((s) => (
          <div class="special-card">
            {s.imageUrl && <img src={s.imageUrl} alt={s.title} loading="lazy" />}
            <div class="special-card__body">
              <h3>{s.title}</h3>
              {s.description && <p>{s.description}</p>}
              {s.price && <span class="special-price">{s.price}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

<style>
.specials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(min(100%,280px),1fr));
  gap: var(--space-6,1.5rem);
  margin-top: var(--space-8,2rem);
}
.special-card {
  background: var(--color-bg-surface, var(--color-surface));
  border-radius: var(--radius-lg,0.75rem);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.special-card img { width:100%; aspect-ratio:4/3; object-fit:cover; }
.special-card__body { padding: var(--space-4,1rem); }
.special-card__body h3 { font-weight:700; margin-bottom:var(--space-2,0.5rem); }
.special-price { font-weight:700; color:var(--color-accent-primary,var(--color-accent)); font-size:1.1rem; }
</style>
`,
  };
}
