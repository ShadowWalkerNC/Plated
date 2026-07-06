import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildBaseLayout(schema: ProjectSchema): AstroFile {
  const siteTitle = schema.seo.siteTitle || schema.business.name;
  const metaDesc  = schema.seo.metaDescription || schema.business.description || '';
  const ogImage   = schema.seo.ogImageUrl   || schema.branding.heroImageUrl  || '';
  const favicon   = schema.branding.faviconUrl || '';
  const gaId      = (schema.extensions as any)?.googleAnalytics?.trackingId ?? '';

  const gaSnippet = gaId ? `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>` : '';

  return {
    path: 'src/layouts/Base.astro',
    content: `---
import Nav  from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
const {
  title       = ${JSON.stringify(siteTitle)},
  description = ${JSON.stringify(metaDesc)},
  ogImage     = ${JSON.stringify(ogImage)},
} = Astro.props;
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />${favicon ? `
  <link rel="icon" href="${favicon}" />` : ''}${ogImage ? `
  <meta property="og:image" content={ogImage} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="stylesheet" href="/src/styles/theme.css" />
  <link rel="stylesheet" href="/src/styles/global.css" />${gaSnippet}
</head>
<body>
  <Nav />
  <main id="main">
    <slot />
  </main>
  <Footer />
</body>
</html>
`,
  };
}
