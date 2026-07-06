// Creates a minimal valid ProjectSchema for plated init
import type { ProjectSchema } from '@plated/types';

export function createDefaultSchema(name: string): ProjectSchema {
  return {
    schemaVersion: '2.0',
    businessType: 'restaurant',
    business: {
      name: name,
      tagline: '',
      description: '',
      phone: '',
      email: '',
      cuisineType: '',
      foundedYear: '',
      existingWebsiteUrl: '',
    },
    branding: {
      logoUrl: '',
      heroImageUrl: '',
      heroVideoUrl: '',
      primaryColor: '#8a4b2f',
      secondaryColor: '#f4ede4',
      accentColor: '#c98f4a',
      faviconUrl: '',
    },
    locations: [],
    primaryLocationIndex: 0,
    menu: {
      categories: [],
      syncSource: null,
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      googleBusiness: '',
      yelp: '',
      tripadvisor: '',
      doordash: '',
      ubereats: '',
      grubhub: '',
      toast: '',
      chownow: '',
    },
    seo: {
      siteTitle: name,
      metaDescription: '',
      googleVerification: '',
      bingVerification: '',
      headSnippet: '',
      bodyStartSnippet: '',
      bodyEndSnippet: '',
    },
    extensions: {},
    deployment: {
      subdomain: '',
      customDomain: '',
      tier: 'self-serve',
    },
    blog: [],
    events: [],
    specials: [],
    press: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies ProjectSchema;
}
