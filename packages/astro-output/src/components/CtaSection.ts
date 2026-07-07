import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildCtaComponent(schema: ProjectSchema): AstroFile {
  const resUrl  = schema.extensions?.reservations?.widgetUrl ?? '';
  const phone   = schema.business.phone ?? '';
  const email   = schema.business.email ?? '';

  return {
    path: 'src/components/CtaSection.astro',
    content: `---
interface Props {
  heading?:  string;
  subtext?:  string;
  btnLabel?: string;
  btnHref?:  string;
}
const {
  heading  = 'Come Visit Us',
  subtext  = ${JSON.stringify(schema.business.tagline ?? '')},
  btnLabel = ${resUrl ? "'Reserve a Table'" : phone ? "'Call Us'" : email ? "'Email Us'" : "'Get in Touch'"},
  btnHref  = ${JSON.stringify(resUrl || (phone ? `tel:${phone}` : email ? `mailto:${email}` : '/contact'))},
} = Astro.props;
---
<section class="section block-cta">
  <div class="container cta-inner">
    <h2 class="cta-heading">{heading}</h2>
    {subtext && <p class="cta-subtext">{subtext}</p>}
    <a class="btn" href={btnHref}>{btnLabel}</a>
  </div>
</section>

<style>
.block-cta {
  background: var(--color-accent-primary, var(--color-accent));
  color: var(--color-text-inverse, #fff);
  text-align: center;
}
.cta-inner    { display: grid; gap: 1.5rem; place-items: center; }
.cta-heading  { font-family: var(--font-display); font-size: clamp(1.8rem,4vw,3rem); font-weight: 700; }
.cta-subtext  { font-size: 1.1rem; max-width: 52ch; opacity: 0.9; }
.block-cta .btn {
  background: var(--color-text-inverse, #fff);
  color: var(--color-accent-primary, var(--color-accent));
}
</style>
`,
  };
}
