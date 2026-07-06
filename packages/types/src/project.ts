import type { BusinessType, StyleTemplate, ColorTheme } from './template.js';

/**
 * ProjectSchema v2.0 — core data contract for Plated.
 *
 * This is the single source of truth for wizard input.
 * The generator reads this and produces an Astro site.
 *
 * Any change here requires updating:
 * - packages/generator
 * - packages/template-engine
 * - packages/builder (wizard fields)
 * - packages/saas (editor fields)
 */
export interface ProjectSchema {
  // ── Meta ────────────────────────────────────────────────────────
  id: string;
  schemaVersion: '2.0';
  createdAt: string;
  updatedAt: string;

  // ── Template ───────────────────────────────────────────────────
  businessType: BusinessType;
  styleTemplate: StyleTemplate;
  colorTheme: ColorTheme;
  darkMode: boolean;

  // ── Business Identity ──────────────────────────────────────────
  business: {
    name: string;
    tagline?: string;
    description: string;
    phone?: string;
    email?: string;
    /** Existing website URL — used as reference for branding hints */
    existingWebsite?: string;
    cuisineType?: string;
    foundedYear?: number;
  };

  // ── Locations (multi-location first-class support) ──────────────────────
  locations: LocationRecord[];
  /** Index into locations[] that is the primary/default location */
  primaryLocationIndex: number;

  // ── Menu ────────────────────────────────────────────────────────
  menu: MenuSchema;

  // ── Branding ────────────────────────────────────────────────────
  branding: {
    logoUrl?: string;
    faviconSourceUrl?: string;
    heroImageUrl?: string;
    heroVideoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };

  // ── Social & Integrations ──────────────────────────────────────────
  social: SocialSchema;
  integrations: IntegrationConfig;

  // ── Content Collections ───────────────────────────────────────────
  blog?: ContentPost[];
  events?: EventPost[];
  specials?: SpecialPost[];
  press?: PressPost[];

  // ── SEO ──────────────────────────────────────────────────────────
  seo: SeoSchema;

  // ── Extensions ────────────────────────────────────────────────────
  extensions: ExtensionConfig;

  // ── Deployment ────────────────────────────────────────────────────
  deployment: {
    target?: 'netlify' | 'vercel' | 'cloudflare' | 'github';
    subdomain?: string;
    customDomain?: string;
  };

  // ── Food Truck Schedule ───────────────────────────────────────────
  locationSchedule?: TruckStop[];
}

// ── Location ──────────────────────────────────────────────────────────
export interface LocationRecord {
  id: string;
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  phone?: string;
  email?: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  hours: HoursSchedule;
  /** Optional: point to a specific menu variant for this location */
  menuVariantId?: string;
}

export interface HoursSchedule {
  schedule: DayHours[];
  holidayNote?: string;
  additionalNotes?: string;
}

export interface DayHours {
  /** 0=Sunday … 6=Saturday */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: boolean;
  /** 24-hour HH:MM */
  openTime?: string;
  closeTime?: string;
  /** Support for split shifts e.g. lunch + dinner */
  secondShift?: { openTime: string; closeTime: string };
}

export interface TruckStop {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locationName: string;
  address?: string;
  startTime?: string;
  endTime?: string;
  mapUrl?: string;
}

// ── Menu ─────────────────────────────────────────────────────────────
export interface MenuSchema {
  /** If connected to Square, the Square location ID used for sync */
  squareLocationId?: string;
  /** When the menu was last synced from Square */
  lastSyncedAt?: string;
  categories: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  dietaryTags?: DietaryTag[];
  available: boolean;
  displayOrder: number;
  /** Modifier groups from Square (allergens, sizes, add-ons) */
  modifierGroups?: ModifierGroup[];
}

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'spicy'
  | 'contains-alcohol';

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  options: Array<{ id: string; name: string; priceDelta?: string }>;
}

// ── Social ───────────────────────────────────────────────────────────
export interface SocialSchema {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  doordash?: string;
  ubereats?: string;
  grubhub?: string;
  toast?: string;
  chownow?: string;
  yelp?: string;
  tripadvisor?: string;
  opentable?: string;
  googleBusiness?: string;
}

// ── Integration Config ──────────────────────────────────────────────
export interface IntegrationConfig {
  square?: {
    connected: boolean;
    locationId?: string;
    merchantId?: string;
    /** accessToken stored encrypted separately — never in project.json */
  };
  facebook?: { connected: boolean; pageId?: string; pageName?: string };
  instagram?: { connected: boolean; accountId?: string; username?: string };
  twitter?: { connected: boolean; userId?: string; handle?: string };
  googleBusiness?: { connected: boolean; accountId?: string; locationId?: string };
  appleMaps?: { connected: boolean; placeId?: string };
  yelp?: { connected: boolean; businessId?: string; alias?: string };
}

// ── Content Collections ───────────────────────────────────────────────
export interface ContentPost {
  id: string;
  type: 'blog' | 'news';
  title: string;
  slug: string;
  excerpt?: string;
  body: string; // Markdown
  coverImageUrl?: string;
  author?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPost {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  ticketUrl?: string;
  recurring?: 'weekly' | 'monthly' | 'none';
  createdAt: string;
}

export interface SpecialPost {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  validFrom?: string;
  validUntil?: string;
  daysAvailable?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
  active: boolean;
  createdAt: string;
}

export interface PressPost {
  id: string;
  publication: string;
  headline: string;
  url?: string;
  publishedAt?: string;
  logoUrl?: string;
}

// ── SEO ────────────────────────────────────────────────────────────
export interface SeoSchema {
  siteTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  googleVerification?: string;
  bingVerification?: string;
  /** Arbitrary head snippet for custom meta/scripts */
  headSnippet?: string;
  bodyStartSnippet?: string;
  bodyEndSnippet?: string;
  structuredDataOverride?: Record<string, unknown>;
}

// ── Extensions ─────────────────────────────────────────────────────────
export interface ExtensionConfig {
  analytics?: {
    plausible?: { enabled: boolean; domain?: string };
    ga4?: { enabled: boolean; measurementId?: string };
  };
  reservations?: {
    provider: 'opentable' | 'resy' | 'sevenrooms' | 'yelp' | 'inhouse';
    widgetUrl?: string;
    restaurantId?: string;
  };
  liveChat?: {
    provider: 'tidio' | 'crisp';
    publicKey: string;
  };
  whatsapp?: { enabled: boolean; phone?: string };
  emailCapture?: {
    provider: 'mailchimp' | 'klaviyo' | 'resend';
    listId?: string;
    apiKey?: string;
  };
  loyalty?: {
    provider: 'square' | 'custom';
    programId?: string;
    linkUrl?: string;
  };
  cookieBanner?: { enabled: boolean; theme?: 'light' | 'dark' };
  googleAnalytics?: { enabled: boolean; measurementId?: string };
  /** Curated CDN libraries toggled on by user */
  cdnLibraries?: CdnLibraryId[];
  /** npm plugins installed via plated-plugin-* */
  plugins?: string[];
}

export type CdnLibraryId =
  | 'swiper'
  | 'gsap'
  | 'aos'
  | 'lottie'
  | 'alpinejs'
  | 'glightbox'
  | 'flatpickr'
  | 'chartjs'
  | 'cookieconsent'
  | 'qrcodejs';
