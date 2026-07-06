import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildMenuComponent(schema: ProjectSchema): AstroFile {
  const cats = schema.menu.categories;

  const categoriesJson = JSON.stringify(cats, null, 2)
    .replace(/`/g, '\\`').replace(/\$/g, '\\$');

  return {
    path: 'src/components/MenuSection.astro',
    content: `---
const categories = ${categoriesJson};
---
<section class="section menu-section">
  <div class="container">
    <h2 class="section-title">Our Menu</h2>
    <div class="menu-grid">
      {categories.map((cat: any) => (
        <div class="menu-category">
          <h3 class="cat-name">{cat.name}</h3>
          {cat.description && <p class="cat-desc">{cat.description}</p>}
          <ul class="item-list">
            {cat.items.map((item: any) => (
              <li class="menu-item">
                <div class="item-row">
                  <span class="item-name">{item.name}</span>
                  {item.price && <span class="item-price">{item.price}</span>}
                </div>
                {item.description && <p class="item-desc">{item.description}</p>}
                {(item.dietary ?? []).length > 0 && (
                  <div class="item-tags">
                    {item.dietary.map((d: string) => <span class="diet-tag">{d}</span>)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
.menu-section { background: var(--color-surface); }
.section-title { font-family: var(--font-display); font-size: clamp(2rem,5vw,3.5rem); font-weight: 700; margin-bottom: 2.5rem; color: var(--color-text); }
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 3rem; }
.cat-name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin-bottom: 0.5rem; }
.cat-desc { color: var(--color-text-muted); margin-bottom: 1.25rem; font-size: 0.95rem; }
.item-list { list-style: none; display: grid; gap: 1rem; }
.menu-item { border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; }
.item-row { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.item-name { font-weight: 700; color: var(--color-text); }
.item-price { font-weight: 700; color: var(--color-accent); white-space: nowrap; }
.item-desc { color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
.item-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
.diet-tag { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.15rem 0.55rem; border-radius: 999px; background: rgba(var(--color-primary-rgb, 138 75 47) / 0.1); color: var(--color-primary); }
</style>
`,
  };
}
