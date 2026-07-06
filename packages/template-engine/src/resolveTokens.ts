import type { ProjectSchema } from '@plated/types';

/**
 * Flattens a ProjectSchema into a flat string token map.
 * Keys use dot-notation matching ContentSlot.field paths.
 * All values are coerced to strings — consumers never receive undefined.
 */
export function resolveTokens(schema: ProjectSchema): Record<string, string> {
  const str = (v: unknown): string =>
    v === null || v === undefined ? '' : String(v);

  const loc = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];

  const tokens: Record<string, string> = {
    // ── Meta ─────────────────────────────────────────────────────
    'id':                    str(schema.id),
    'schemaVersion':         str(schema.schemaVersion),
    'businessType':          str(schema.businessType),
    'styleTemplate':         str(schema.styleTemplate),
    'colorTheme':            str(schema.colorTheme),
    'darkMode':              str(schema.darkMode),

    // ── Business ─────────────────────────────────────────────────
    'business.name':         str(schema.business.name),
    'business.tagline':      str(schema.business.tagline),
    'business.description':  str(schema.business.description),
    'business.phone':        str(schema.business.phone),
    'business.email':        str(schema.business.email),
    'business.cuisineType':  str(schema.business.cuisineType),
    'business.foundedYear':  str(schema.business.foundedYear),
    'business.existingWebsite': str(schema.business.existingWebsite),

    // ── Branding ─────────────────────────────────────────────────
    'branding.primaryColor':      str(schema.branding.primaryColor),
    'branding.secondaryColor':    str(schema.branding.secondaryColor),
    'branding.accentColor':       str(schema.branding.accentColor),
    'branding.logoUrl':           str(schema.branding.logoUrl),
    'branding.heroImageUrl':      str(schema.branding.heroImageUrl),
    'branding.heroVideoUrl':      str(schema.branding.heroVideoUrl),
    'branding.faviconSourceUrl':  str(schema.branding.faviconSourceUrl),

    // ── SEO ──────────────────────────────────────────────────────
    'seo.siteTitle':              str(schema.seo.siteTitle),
    'seo.metaDescription':        str(schema.seo.metaDescription),
    'seo.ogImageUrl':             str(schema.seo.ogImageUrl),
    'seo.googleVerification':     str(schema.seo.googleVerification),
    'seo.bingVerification':       str(schema.seo.bingVerification),

    // ── Social ───────────────────────────────────────────────────
    'social.instagram':           str(schema.social.instagram),
    'social.facebook':            str(schema.social.facebook),
    'social.twitter':             str(schema.social.twitter),
    'social.tiktok':              str(schema.social.tiktok),
    'social.youtube':             str(schema.social.youtube),
    'social.doordash':            str(schema.social.doordash),
    'social.ubereats':            str(schema.social.ubereats),
    'social.grubhub':             str(schema.social.grubhub),
    'social.yelp':                str(schema.social.yelp),
    'social.tripadvisor':         str(schema.social.tripadvisor),
    'social.opentable':           str(schema.social.opentable),
    'social.googleBusiness':      str(schema.social.googleBusiness),

    // ── Deployment ───────────────────────────────────────────────
    'deployment.target':          str(schema.deployment.target),
    'deployment.subdomain':       str(schema.deployment.subdomain),
    'deployment.customDomain':    str(schema.deployment.customDomain),
  };

  // ── Primary Location ─────────────────────────────────────────
  if (loc) {
    tokens['location.id']           = str(loc.id);
    tokens['location.name']         = str(loc.name);
    tokens['location.address1']     = str(loc.address1);
    tokens['location.address2']     = str(loc.address2);
    tokens['location.city']         = str(loc.city);
    tokens['location.state']        = str(loc.state);
    tokens['location.zip']          = str(loc.zip);
    tokens['location.country']      = str(loc.country);
    tokens['location.phone']        = str(loc.phone);
    tokens['location.email']        = str(loc.email);
    tokens['location.googleMapsUrl']= str(loc.googleMapsUrl);
    tokens['location.googlePlaceId']= str(loc.googlePlaceId);
  }

  return tokens;
}
