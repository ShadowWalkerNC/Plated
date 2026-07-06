/**
 * BusinessType — 8 hospitality types for v1.
 */
export type BusinessType =
  | 'restaurant'
  | 'food-truck'
  | 'bar'
  | 'cafe'
  | 'bakery'
  | 'catering'
  | 'food-stand'
  | 'ghost-kitchen';

/**
 * StyleTemplate — 6 visual styles.
 * Each injects CSS variables ONLY — zero content logic.
 */
export type StyleTemplate =
  | 'hearth'
  | 'spark'
  | 'steel'
  | 'bloom'
  | 'obsidian'
  | 'ghost';

/** 3 color theme variants per style */
export type ColorTheme = 'default' | 'warm' | 'cool';

export type SlotType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'video'
  | 'list'
  | 'boolean'
  | 'number'
  | 'hours'
  | 'menu'
  | 'schedule'
  | 'social'
  | 'seo'
  | 'location'
  | 'content-collection'
  | 'extension';

/**
 * BlockType — the types of draggable content blocks.
 */
export type BlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'menu-preview'
  | 'hours'
  | 'map'
  | 'social-feed'
  | 'cta'
  | 'testimonials'
  | 'specials'
  | 'events-list'
  | 'blog-list'
  | 'press'
  | 'delivery-links'
  | 'reservation-widget'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'custom-embed';

/**
 * BlockSchema — a single draggable content block in the editor.
 * Blocks live inside sections. Sections live on pages.
 */
export interface BlockSchema {
  id: string;
  type: BlockType;
  /** Display order within its parent section */
  order: number;
  visible: boolean;
  /** Block-specific config — keys depend on type */
  config: Record<string, unknown>;
}

/**
 * ContentSlot — a single mappable content field in a template manifest.
 */
export interface ContentSlot {
  /** Dot-notation path into ProjectSchema e.g. 'business.name' */
  field: string;
  type: SlotType;
  required: boolean;
  label: string;
  hint?: string;
  wizardStep: number;
}

/**
 * TemplateSection — a section within a page with ordered blocks.
 */
export interface TemplateSection {
  id: string;
  name: string;
  /** Display order on the page */
  order: number;
  visible: boolean;
  blocks: BlockSchema[];
}

/**
 * TemplatePage — a page definition with sections + slots.
 */
export interface TemplatePage {
  id: string;
  path: string;
  title: string;
  /** Whether users can toggle this page off */
  optional: boolean;
  sections: TemplateSection[];
  usesSlots: string[];
}

/**
 * TemplateManifest — plated.template.json contract.
 */
export interface TemplateManifest {
  manifestVersion: '2.0';
  businessType: BusinessType;
  displayName: string;
  description: string;
  slots: ContentSlot[];
  pages: TemplatePage[];
  compatibleStyles: StyleTemplate[];
  defaultStyle: StyleTemplate;
}

/**
 * PluginManifest — what an npm plated-plugin-* package exports.
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  /** Additional wizard steps this plugin injects */
  wizardSteps?: Array<{
    stepIndex: number;
    title: string;
    component: string;
  }>;
  /** Zod schema path for plugin config validation */
  configSchemaPath?: string;
  /** Astro component paths to inject into templates */
  components?: Array<{
    slot: 'head' | 'body-start' | 'body-end' | 'nav' | 'footer';
    path: string;
  }>;
  /** Environment variables required by this plugin */
  envVars?: Array<{
    key: string;
    required: boolean;
    description: string;
  }>;
  /** CDN scripts this plugin adds */
  cdnScripts?: string[];
  /** Build hook — called during site generation */
  onBuild?: string; // module path to async function
}
