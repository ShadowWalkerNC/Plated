import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildHeroComponent(schema: ProjectSchema): AstroFile {
  const name    = schema.business.name;
  const tagline = schema.business.tagline;
  const hero    = schema.branding.heroImageUrl;
  const resUrl  = (schema.social as any).reservationUrl ?? '';
  const menuCTA = schema.menu.categories.length > 0;

  return {
    path: 'src/components/Hero.astro',
    content: `---
interface Props {
  title?:   string;
  tagline?: string;
}
const {
  title   = ${JSON.stringify(name)},
  tagline = ${JSON.stringify(tagline ?? '')},
} = Astro.props;
---
<section class="hero"${hero ? ` style="--hero-img: url('${hero}')"` : ''}>
  <div class="hero__inner">
    <h1 class="hero__title">{title}</h1>
    {tagline && <p class="hero__tagline">{tagline}</p>}
    <div class="hero__actions">
      ${menuCTA ? `<a class="btn" href="/menu">View Menu</a>` : ''}
      ${resUrl  ? `<a class="btn btn-ghost" href="${resUrl}" target="_blank" rel="noreferrer">Reserve a Table</a>` : ''}
    </div>
  </div>
</section>

<style>
.hero {
  position: relative;
  min-height: 88vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 7rem 1.5rem;
  background-image: var(--hero-img, none);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55));
  pointer-events: none;
}
.hero__inner {
  position: relative; z-index: 1;
  display: grid; gap: 1.5rem; place-items: center;
}
.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 7rem);
  font-weight: 700; line-height: 1.05;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.hero__tagline {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: rgba(255,255,255,0.88);
  max-width: 52ch;
}
.hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
</style>
`,
  };
}
