import type { BusinessType, StyleTemplate, ColorTheme } from './template.js';

/**
 * ProjectSchema — the core data contract for NexCMS.
 *
 * This is the single source of truth for what a user fills in
 * during the wizard. The generator reads this and produces
 * an Astro site output.
 *
 * Any change to this interface requires updating:
 * - packages/generator
 * - packages/template-engine
 * - packages/builder (wizard fields)
 * - packages/saas (editor fields)
 */
export interface ProjectSchema {
  // ── Meta ─────────────────────────────────────────────────
  /** Internal project ID (UUID) */
  id: string;
  /** Schema version for forward-compatibility */
  schemaVersion: '1.0';
  /** When this project was first created */
  createdAt: string;
  /** When this project was last saved */
  updatedAt: string;

  // ── Template Selection ────────────────────────────────────
  businessType: BusinessType;
  styleTemplate: StyleTemplate;
  colorTheme: ColorTheme;

  // ── Business Identity ────────────────────────────────────
  business: {
    name: string;
    tagline?: string | undefined;
    description: string;
    /** Primary phone number */
    phone?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
  };

  // ── Location ────────────────────────────────────────────
  location: {
    /** Street address line 1 */
    address1?: string | undefined;
    address2?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    country: string;
    /** Google Maps embed URL or Place ID */
    googleMapsUrl?: string | undefined;
  };

  // ── Hours ──────────────────────────────────────────────
  hours: {
    /** day index: 0=Sunday … 6=Saturday */
    schedule: Array<{
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      open: boolean;
      /** 24-hour format HH:MM */
      openTime?: string | undefined;
      closeTime?: string | undefined;
    }>;
    holidayNote?: string | undefined;
  };

  // ── Menu ──────────────────────────────────────────────
  menu: {
    categories: Array<{
      id: string;
      name: string;
      description?: string | undefined;
      items: Array<{
        id: string;
        name: string;
        description?: string | undefined;
        price?: string | undefined;
        /** Storage path or URL */
        imageUrl?: string | undefined;
        /** e.g. 'vegetarian', 'vegan', 'gluten-free', 'spicy' */
        dietaryTags?: string[] | undefined;
        available: boolean;
      }>;
    }>;
  };

  // ── Branding ──────────────────────────────────────────
  branding: {
    /** Storage path or URL for primary logo */
    logoUrl?: string | undefined;
    /** Storage path or URL for favicon source (min 512×512) */
    faviconSourceUrl?: string | undefined;
    /** Hex color extracted from logo or chosen by user */
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
  };

  // ── Social Media ──────────────────────────────────────
  social: {
    facebook?: string | undefined;
    instagram?: string | undefined;
    tiktok?: string | undefined;
    twitter?: string | undefined;
    youtube?: string | undefined;
    /** DoorDash listing URL */
    doordash?: string | undefined;
    /** Uber Eats listing URL */
    ubereats?: string | undefined;
    /** Grubhub listing URL */
    grubhub?: string | undefined;
    /** Google Business Profile URL */
    googleBusiness?: string | undefined;
  };

  // ── SEO ───────────────────────────────────────────────
  seo: {
    /** Defaults to business.name if not set */
    siteTitle?: string | undefined;
    /** Defaults to business.description if not set */
    metaDescription?: string | undefined;
    /** Injected into <head> — used for Google verification etc. */
    headSnippet?: string | undefined;
  };

  // ── Deployment ────────────────────────────────────────
  deployment: {
    /** Local mode: preferred deploy target for instructions */
    target?: 'netlify' | 'vercel' | 'cloudflare' | 'github' | undefined;
    /** SaaS mode: subdomain on nexcms.io */
    subdomain?: string | undefined;
    /** SaaS mode: custom domain if configured */
    customDomain?: string | undefined;
  };

  // ── Food Truck Extras ────────────────────────────────
  /** Only relevant when businessType === 'food-truck' or 'food-stand' */
  locationSchedule?: Array<{
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    locationName: string;
    address?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
  }> | undefined;

  // ── Events (Bar / Nightclub) ─────────────────────────
  /** Only relevant when businessType === 'bar' */
  events?: Array<{
    id: string;
    title: string;
    date: string;
    description?: string | undefined;
    ticketUrl?: string | undefined;
  }> | undefined;
}
