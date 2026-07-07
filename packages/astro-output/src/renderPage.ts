/**
 * renderPage.ts — turns a TemplatePage (from the manifest) into an
 * Astro .astro file string by walking sections → blocks.
 *
 * The output is a self-contained .astro file with an optional frontmatter
 * fence that imports Base layout and any block-specific Astro components
 * that need their own <style> block (e.g. Hero).
 */
import type { ProjectSchema, TemplateManifest, TemplatePage } from '@plated/types';
import type { AstroFile } from './types.js';
import { renderBlock } from './renderBlock.js';

/**
 * renderManifestPage — produces one AstroFile per TemplatePage.
 */
export function renderManifestPage(
  schema:   ProjectSchema,
  _manifest: TemplateManifest,
  page:     TemplatePage,
): AstroFile {
  const title     = page.title;
  const siteTitle = schema.seo.siteTitle || schema.business.name;
  const pageTitle = title ? `${title} - ${siteTitle}` : siteTitle;

  // Collect visible sections in order
  const sections = [...page.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  // Render all blocks
  const bodyLines: string[] = [];
  for (const section of sections) {
    const blocks = [...section.blocks]
      .filter((b) => b.visible)
      .sort((a, b) => a.order - b.order);
    for (const block of blocks) {
      bodyLines.push(renderBlock(schema, block));
    }
  }

  // Astro path: manifest page.path is like '/', '/menu', '/contact', etc.
  const pagePath = page.path === '/'
    ? 'src/pages/index.astro'
    : `src/pages${page.path.endsWith('/') ? page.path.slice(0, -1) : page.path}.astro`;

  const content = [
    `---`,
    `import Base from '${pagePath.startsWith('src/pages/') ? '../' : '../../'}layouts/Base.astro';`,
    `---`,
    `<Base title="${pageTitle}">`,
    ...bodyLines,
    `</Base>`,
    '',
  ].join('\n');

  return { path: pagePath, content };
}

/**
 * renderManifestPages — renders all non-optional (or enabled) pages
 * from a manifest into AstroFiles.
 */
export function renderManifestPages(
  schema:   ProjectSchema,
  manifest: TemplateManifest,
): AstroFile[] {
  return manifest.pages
    .filter((p) => !p.optional || p.sections.some((s) => s.blocks.length > 0))
    .map((page) => renderManifestPage(schema, manifest, page));
}
