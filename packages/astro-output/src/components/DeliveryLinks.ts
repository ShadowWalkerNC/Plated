import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildDeliveryLinksComponent(schema: ProjectSchema): AstroFile {
  type Link = { label: string; href: string };
  const links: Link[] = [
    schema.social.doordash  && { label: 'DoorDash',  href: schema.social.doordash },
    schema.social.ubereats  && { label: 'Uber Eats', href: schema.social.ubereats },
    schema.social.grubhub   && { label: 'Grubhub',  href: schema.social.grubhub },
    schema.social.toast     && { label: 'Toast',     href: schema.social.toast },
    schema.social.chownow   && { label: 'ChowNow',  href: schema.social.chownow },
  ].filter((l): l is Link => Boolean(l));

  const json = JSON.stringify(links, null, 2);

  return {
    path: 'src/components/DeliveryLinks.astro',
    content: `---
type Link = { label: string; href: string };
const links: Link[] = ${json};
---
{links.length > 0 && (
  <section class="section block-delivery">
    <div class="container">
      <h2 class="section-title">Order Online</h2>
      <div class="delivery-grid">
        {links.map((l) => (
          <a class="btn btn-ghost delivery-btn" href={l.href} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  </section>
)}

<style>
.delivery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4,1rem);
  margin-top: var(--space-8,2rem);
}
.delivery-btn {
  flex: 1 1 160px;
  justify-content: center;
  font-size: 1rem;
}
</style>
`,
  };
}
