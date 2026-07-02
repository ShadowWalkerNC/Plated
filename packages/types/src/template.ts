/**
 * BusinessType — the 8 supported hospitality business types in v1.
 * Phase 2 expands to small-business, startup, portfolio, event-venue.
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
 * StyleTemplate — the 6 visual styles.
 * Each style injects CSS variables only — zero content logic.
 */
export type StyleTemplate =
  | 'hearth'
  | 'spark'
  | 'steel'
  | 'bloom'
  | 'obsidian'
  | 'ghost';

/**
 * ColorTheme — the 3 standard color theme variants per style.
 */
export type ColorTheme = 'default' | 'warm' | 'cool';

export type SlotType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'list'
  | 'boolean'
  | 'hours'
  | 'menu'
  | 'schedule'
  | 'social'
  | 'seo';

/**
 * ContentSlot — a single mappable content field in a template manifest.
 */
export interface ContentSlot {
  /** Dot-notation path into ProjectSchema, e.g. 'business.name' */
  field: string;
  type: SlotType;
  required: boolean;
  label: string;
  hint?: string | undefined;
  /** Which wizard step this slot appears in */
  wizardStep: number;
}

/**
 * TemplateManifest — the nexcms.template.json contract.
 * CP2: manifest spec locked — Phase 0 checkpoint complete.
 */
export interface TemplateManifest {
  /** Manifest format version */
  manifestVersion: '1.0';
  businessType: BusinessType;
  /** Human-readable display name */
  displayName: string;
  description: string;
  /** All content slots this template exposes to the wizard */
  slots: ContentSlot[];
  /** Ordered list of pages this template generates */
  pages: Array<{
    id: string;
    path: string;
    title: string;
    /** Slot field names used on this page */
    usesSlots: string[];
  }>;
  /** Compatible style templates */
  compatibleStyles: StyleTemplate[];
  /** Default style if user skips selection */
  defaultStyle: StyleTemplate;
}
