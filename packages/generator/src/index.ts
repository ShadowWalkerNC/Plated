// @nexcms/generator — Phase 1 implementation
// Responsibility: reads a validated ProjectSchema and produces
// a complete Astro site output directory.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTemplate } from '@nexcms/template-engine';
import type { ProjectSchema } from '@nexcms/types';

export interface GenerateOptions {
  /** Absolute path to write output files */
  outputDir: string;
  /** Include full Astro source (true) or pre-built static only (false) */
  includeSource: boolean;
  /** Optional override for template directory */
  templateDir?: string;
  /** Resolve and return results without writing files to disk */
  dryRun?: boolean;
}

export interface GenerateResult {
  success: boolean;
  outputDir: string;
  filesWritten: number;
  errors: string[];
  warnings: string[];
  templateUsed: string;
}

interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * generate — core entry point.
 * Reads a ProjectSchema, resolves the template manifest,
 * maps content slots, and writes a complete Astro project to outputDir.
 */
export async function generate(
  schema: ProjectSchema,
  options: GenerateOptions,
): Promise<GenerateResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const templateDir = resolveTemplateDir(schema, options);
    const resolved = await resolveTemplate(templateDir, schema);

    if (resolved.missingRequired.length > 0) {
      warnings.push(
        `Missing required slots: ${resolved.missingRequired.join(', ')}`,
      );
    }

    const files: GeneratedFile[] = [
      ...scaffoldAstroProject(schema),
      writeAstroLayout(schema),
      ...writeAstroPages(schema, resolved),
      ...writeContentFiles(schema),
      ...writeSiteConfig(schema),
    ];

    if (options.dryRun) {
      return {
        success: true,
        outputDir: options.outputDir,
        filesWritten: files.length,
        errors,
        warnings,
        templateUsed: templateDir,
      };
    }

    await rm(options.outputDir, { recursive: true, force: true });
    await mkdir(options.outputDir, { recursive: true });

    for (const file of files) {
      const absPath = join(options.outputDir, file.path);
      await mkdir(dirname(absPath), { recursive: true });
      await writeFile(absPath, file.content, 'utf-8');
    }

    return {
      success: errors.length === 0,
      outputDir: options.outputDir,
      filesWritten: files.length,
      errors,
      warnings,
      templateUsed: templateDir,
    };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
    return {
      success: false,
      outputDir: options.outputDir,
      filesWritten: 0,
      errors,
      warnings,
      templateUsed: options.templateDir ?? '',
    };
  }
}

// ── Stage 1: resolve template directory ─────────────────────────────────────

function resolveTemplateDir(
  schema: ProjectSchema,
  options: GenerateOptions,
): string {
  if (options.templateDir) return resolve(options.templateDir);
  const thisFile = fileURLToPath(import.meta.url);
  const repoRoot = resolve(dirname(thisFile), '..', '..', '..', '..');
  return join(repoRoot, 'templates', schema.businessType);
}

// ── Stage 2: scaffold Astro project files ────────────────────────────────────

function scaffoldAstroProject(schema: ProjectSchema): GeneratedFile[] {
  const siteName = schema.business.name || 'NexCMS Site';
  const subdomain = schema.deployment.subdomain ?? 'example';

  return [
    {
      path: 'package.json',
      content:
        JSON.stringify(
          {
            name: slugify(siteName),
            private: true,
            type: 'module',
            scripts: {
              dev: 'astro dev',
              build: 'astro build',
              preview: 'astro preview',
            },
            dependencies: { astro: '^5.0.0' },
          },
          null,
          2,
        ) + '\n',
    },
    {
      path: 'astro.config.mjs',
      content: `import { defineConfig } from 'astro/config';\n\nexport default defineConfig({\n  site: 'https://${subdomain}.nexcms.io',\n});\n`,
    },
    {
      path: 'tsconfig.json',
      content:
        JSON.stringify({ extends: 'astro/tsconfigs/strict' }, null, 2) + '\n',
    },
    {
      path: 'src/env.d.ts',
      content: '/// <reference types="astro/client" />\n',
    },
    {
      path: 'src/styles/global.css',
      content: buildGlobalCss(schema),
    },
  ];
}

// ── Stage 3: Base layout ─────────────────────────────────────────────────────

function writeAstroLayout(schema: ProjectSchema): GeneratedFile {
  const siteTitle = schema.seo.siteTitle || schema.business.name;
  const metaDesc = schema.seo.metaDescription || schema.business.description || '';

  const googleVerif = schema.seo.googleVerification
    ? `    <meta name="google-site-verification" content="${escapeHtml(schema.seo.googleVerification)}" />\n`
    : '';
  const bingVerif = schema.seo.bingVerification
    ? `    <meta name="msvalidate.01" content="${escapeHtml(schema.seo.bingVerification)}" />\n`
    : '';
  const headSnippet = schema.seo.headSnippet
    ? `    ${schema.seo.headSnippet}\n`
    : '';
  const bodyStart = schema.seo.bodyStartSnippet
    ? `    ${schema.seo.bodyStartSnippet}\n`
    : '';
  const bodyEnd = schema.seo.bodyEndSnippet
    ? `    ${schema.seo.bodyEndSnippet}\n`
    : '';

  return {
    path: 'src/layouts/Base.astro',
    content: `---
const { title = ${JSON.stringify(siteTitle)}, description = ${JSON.stringify(metaDesc)} } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="stylesheet" href="/src/styles/global.css" />
${googleVerif}${bingVerif}${headSnippet}  </head>
  <body>
${bodyStart}    <slot />
${bodyEnd}  </body>
</html>
`,
  };
}

// ── Stage 4: pages ───────────────────────────────────────────────────────────

function writeAstroPages(
  schema: ProjectSchema,
  resolved: Awaited<ReturnType<typeof resolveTemplate>>,
): GeneratedFile[] {
  return resolved.pages
    .filter((page) => shouldWritePage(page, schema))
    .map((page) => {
      const astroPath =
        page.path === '/'
          ? 'src/pages/index.astro'
          : `src/pages${page.path}.astro`;

      const sectionsMarkup = page.sections
        .filter((s) => s.visible)
        .map(
          (section) =>
            `<section id="${section.id}" class="section section-${section.id}">\n` +
            section.blocks
              .filter((b) => b.visible)
              .map((b) => '  ' + renderBlock(b.type, b.config, schema))
              .join('\n') +
            '\n</section>',
        )
        .join('\n\n');

      return {
        path: astroPath,
        content: `---
import Base from '../layouts/Base.astro';
---
<Base title=${JSON.stringify(page.title)}>
${sectionsMarkup}
</Base>
`,
      };
    });
}

// ── Stage 5: content collections ────────────────────────────────────────────

function writeContentFiles(schema: ProjectSchema): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const post of schema.blog ?? []) {
    files.push({
      path: `src/content/blog/${post.slug}.md`,
      content: `---\ntitle: ${JSON.stringify(post.title)}\nexcerpt: ${JSON.stringify(post.excerpt ?? '')}\nauthor: ${JSON.stringify(post.author ?? '')}\npublishedAt: ${JSON.stringify(post.publishedAt ?? '')}\n---\n\n${post.body}\n`,
    });
  }

  if (schema.events?.length) {
    files.push({
      path: 'src/content/events/events.json',
      content: JSON.stringify(schema.events, null, 2) + '\n',
    });
  }

  if (schema.specials?.length) {
    files.push({
      path: 'src/content/specials/specials.json',
      content: JSON.stringify(schema.specials, null, 2) + '\n',
    });
  }

  if (schema.press?.length) {
    files.push({
      path: 'src/content/press/press.json',
      content: JSON.stringify(schema.press, null, 2) + '\n',
    });
  }

  return files;
}

// ── Stage 6: public/ site config ────────────────────────────────────────────

function writeSiteConfig(schema: ProjectSchema): GeneratedFile[] {
  const subdomain = schema.deployment.subdomain ?? 'example';
  return [
    {
      path: 'public/nexcms-site.json',
      content: JSON.stringify(schema, null, 2) + '\n',
    },
    {
      path: 'public/robots.txt',
      content: `User-agent: *\nAllow: /\nSitemap: https://${subdomain}.nexcms.io/sitemap-index.xml\n`,
    },
    {
      path: 'README.md',
      content: `# ${schema.business.name}\n\nGenerated by [NexCMS](https://nexcms.io).\n`,
    },
  ];
}

// ── Page filter ──────────────────────────────────────────────────────────────

function shouldWritePage(
  page: Awaited<ReturnType<typeof resolveTemplate>>['pages'][number],
  schema: ProjectSchema,
): boolean {
  if (!page.optional) return true;
  if (page.id === 'blog') return Boolean(schema.blog?.length);
  if (page.id === 'events') return Boolean(schema.events?.length);
  if (page.id === 'about') return Boolean(schema.business.description);
  return true;
}

// ── Block renderer ───────────────────────────────────────────────────────────

function renderBlock(
  type: string,
  config: Record<string, unknown>,
  schema: ProjectSchema,
): string {
  switch (type) {
    case 'hero':
      return [
        '<div class="block hero-block">',
        `  <h1>${escapeHtml(String(config.slot_name ?? schema.business.name ?? ''))}</h1>`,
        config.slot_tagline ? `  <p class="tagline">${escapeHtml(String(config.slot_tagline))}</p>` : '',
        config.ctaHref ? `  <a class="btn" href="${escapeHtml(String(config.ctaHref))}">${escapeHtml(String(config.ctaLabel ?? 'Learn more'))}</a>` : '',
        '</div>',
      ].filter(Boolean).join('\n');

    case 'text':
      return `<div class="block text-block"><p>${escapeHtml(String(config.slot_body ?? ''))}</p></div>`;

    case 'image':
      return config.slot_image
        ? `<div class="block image-block"><img src="${escapeHtml(String(config.slot_image))}" alt="" /></div>`
        : '';

    case 'gallery':
      return '<div class="block gallery-block"><!-- Gallery: Phase 2 --></div>';

    case 'menu-preview':
      return renderMenuPreview(schema);

    case 'hours':
      return renderHours(schema);

    case 'map':
      return renderMap(schema);

    case 'social-feed':
      return '<div class="block social-feed-block"><!-- Social feed: Phase 3 --></div>';

    case 'cta':
      return `<div class="block cta-block"><a class="btn" href="/contact">Contact us</a></div>`;

    case 'testimonials':
      return '<div class="block testimonials-block"><!-- Testimonials: Phase 2 --></div>';

    case 'specials':
      return schema.specials?.length
        ? `<div class="block specials-block"><h2>Specials</h2><p>${schema.specials.length} special${schema.specials.length > 1 ? 's' : ''} available.</p></div>`
        : '';

    case 'events-list':
      return schema.events?.length
        ? `<div class="block events-block"><h2>Events</h2><p>${schema.events.length} upcoming event${schema.events.length > 1 ? 's' : ''}.</p></div>`
        : '<div class="block events-block"><p>No upcoming events.</p></div>';

    case 'blog-list':
      return schema.blog?.length
        ? `<div class="block blog-block"><h2>Latest Posts</h2><p>${schema.blog.length} post${schema.blog.length > 1 ? 's' : ''} available.</p></div>`
        : '<div class="block blog-block"><p>No posts yet.</p></div>';

    case 'press':
      return schema.press?.length
        ? `<div class="block press-block"><h2>Press</h2><p>${schema.press.length} mention${schema.press.length > 1 ? 's' : ''}.</p></div>`
        : '';

    case 'delivery-links':
      return renderDeliveryLinks(schema);

    case 'reservation-widget':
      return '<div class="block reservation-block"><!-- Reservation widget: Phase 3 --></div>';

    case 'video':
      return config.slot_video
        ? `<div class="block video-block"><a href="${escapeHtml(String(config.slot_video))}" target="_blank" rel="noreferrer">Watch video</a></div>`
        : '';

    case 'divider':
      return '<hr class="block divider-block" />';

    case 'spacer':
      return '<div class="block spacer-block" aria-hidden="true" style="height:2rem"></div>';

    case 'custom-embed':
      return `<div class="block custom-embed-block">${String(config.embedHtml ?? '')}</div>`;

    default:
      return `<!-- Unknown block: ${escapeHtml(type)} -->`;
  }
}

// ── Block render helpers ─────────────────────────────────────────────────────

function renderMenuPreview(schema: ProjectSchema): string {
  if (!schema.menu.categories.length) {
    return '<div class="block menu-block"><p>Menu coming soon.</p></div>';
  }

  const html = schema.menu.categories
    .slice(0, 3)
    .map(
      (cat) =>
        `<section class="menu-category">\n` +
        `  <h2>${escapeHtml(cat.name)}</h2>\n` +
        (cat.description ? `  <p>${escapeHtml(cat.description)}</p>\n` : '') +
        `  <ul>\n` +
        cat.items
          .slice(0, 6)
          .map(
            (item) =>
              `    <li><strong>${escapeHtml(item.name)}</strong>` +
              (item.price ? ` — ${escapeHtml(item.price)}` : '') +
              (item.description ? `<br />${escapeHtml(item.description)}` : '') +
              `</li>`,
          )
          .join('\n') +
        `\n  </ul>\n</section>`,
    )
    .join('\n');

  return `<div class="block menu-block">\n${html}\n</div>`;
}

function renderHours(schema: ProjectSchema): string {
  const loc =
    schema.locations[schema.primaryLocationIndex] ?? schema.locations[0];
  if (!loc)
    return '<div class="block hours-block"><p>Hours unavailable.</p></div>';

  const rows = loc.hours.schedule
    .map(
      (d) =>
        `<li><strong>${dayLabel(d.day)}:</strong> ${escapeHtml(
          d.open ? `${d.openTime ?? ''}–${d.closeTime ?? ''}` : 'Closed',
        )}</li>`,
    )
    .join('');

  return `<div class="block hours-block"><h2>Hours</h2><ul>${rows}</ul></div>`;
}

function renderMap(schema: ProjectSchema): string {
  const loc =
    schema.locations[schema.primaryLocationIndex] ?? schema.locations[0];
  if (!loc)
    return '<div class="block map-block"><p>Map unavailable.</p></div>';

  if (loc.googleMapsUrl) {
    return `<div class="block map-block"><a href="${escapeHtml(loc.googleMapsUrl)}" target="_blank" rel="noreferrer">View on Google Maps</a></div>`;
  }

  const address = [loc.address1, loc.address2, loc.city, loc.state, loc.zip, loc.country]
    .filter(Boolean)
    .join(', ');

  return `<div class="block map-block"><address>${escapeHtml(address || 'Location available on request.')}</address></div>`;
}

function renderDeliveryLinks(schema: ProjectSchema): string {
  const links: [string, string | undefined][] = [
    ['DoorDash', schema.social.doordash],
    ['Uber Eats', schema.social.ubereats],
    ['Grubhub', schema.social.grubhub],
    ['Toast', schema.social.toast],
    ['ChowNow', schema.social.chownow],
  ];

  const active = links.filter(([, url]) => Boolean(url));
  if (!active.length) return '';

  return (
    `<div class="block delivery-links-block"><ul>` +
    active
      .map(
        ([label, url]) =>
          `<li><a href="${escapeHtml(String(url))}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a></li>`,
      )
      .join('') +
    `</ul></div>`
  );
}

// ── Global CSS ───────────────────────────────────────────────────────────────

function buildGlobalCss(schema: ProjectSchema): string {
  return `:root {
  --color-primary: ${schema.branding.primaryColor ?? '#7a3b1d'};
  --color-secondary: ${schema.branding.secondaryColor ?? '#f4ede4'};
  --color-accent: ${schema.branding.accentColor ?? '#c98f4a'};
  --color-text: #1f1f1f;
  --color-bg: #ffffff;
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}
.section { padding: 3rem 1.25rem; }
.block { max-width: 960px; margin: 0 auto; }
h1, h2, h3 { line-height: 1.2; margin: 0 0 1rem; }
p { margin: 0 0 1rem; }
ul { padding-left: 1.25rem; }
address { font-style: normal; }
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 600;
}
.hero-block { text-align: center; padding: 5rem 1.25rem; }
.menu-category { margin-bottom: 2rem; }
.divider-block { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
`;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'nexcms-site'
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dayLabel(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] ?? 'Day';
}
