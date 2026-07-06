import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildIndexPage(schema: ProjectSchema): AstroFile {
  const hasMenu     = schema.menu.categories.length > 0;
  const hasHours    = Boolean(schema.locations?.[0]?.hours?.schedule?.length);
  const hasLocation = Boolean(schema.locations?.[0]);
  const hasDelivery = Object.values(schema.social).some((v) =>
    ['doordash','ubereats','grubhub','toast','chownow'].includes('') ? false :
    typeof v === 'string' && v.length > 0 &&
    (schema.social.doordash || schema.social.ubereats || schema.social.grubhub || schema.social.toast || schema.social.chownow)
  );
  const hasDeliveryLinks = Boolean(
    schema.social.doordash || schema.social.ubereats ||
    schema.social.grubhub  || schema.social.toast    || schema.social.chownow
  );

  return {
    path: 'src/pages/index.astro',
    content: `---
import Base            from '../layouts/Base.astro';
import Hero            from '../components/Hero.astro';
${hasMenu     ? "import MenuSection    from '../components/MenuSection.astro';" : ''}
${hasHours    ? "import HoursSection   from '../components/HoursSection.astro';" : ''}
${hasLocation ? "import LocationSection from '../components/LocationSection.astro';" : ''}
${hasDeliveryLinks ? "import SocialLinks    from '../components/SocialLinks.astro';" : ''}
import Gallery        from '../components/Gallery.astro';
---
<Base>
  <Hero />
  <Gallery />
  ${hasMenu     ? '<MenuSection />'     : ''}
  ${hasDeliveryLinks ? '<SocialLinks />'  : ''}
  ${hasHours    ? '<HoursSection />'    : ''}
  ${hasLocation ? '<LocationSection />' : ''}
</Base>
`,
  };
}
