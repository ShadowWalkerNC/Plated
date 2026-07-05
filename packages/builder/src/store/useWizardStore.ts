// Zustand store — single source of truth for the wizard
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ProjectSchema } from '@nexcms/types';
import type { Screen } from '../App.js';

const TOTAL_STEPS = 8;

export interface WizardStore {
  // Navigation
  screen: Screen;
  currentStep: number;
  totalSteps: number;

  // Project
  schema: ProjectSchema;
  projectFilePath: string | null;
  isDirty: boolean;

  // Actions — navigation
  setScreen: (screen: Screen) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions — project
  initProject: (schema: ProjectSchema, filePath: string | null) => void;
  updateSchema: (patch: DeepPartial<ProjectSchema>) => void;
  setProjectFilePath: (path: string) => void;
  markClean: () => void;
}

// Minimal default schema — wizard fills it in
const DEFAULT_SCHEMA: ProjectSchema = {
  schemaVersion: '2.0',
  businessType: 'restaurant',
  business: {
    name: '',
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
  menu: { categories: [], syncSource: null },
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
    siteTitle: '',
    metaDescription: '',
    googleVerification: '',
    bingVerification: '',
    headSnippet: '',
    bodyStartSnippet: '',
    bodyEndSnippet: '',
  },
  extensions: {},
  deployment: { subdomain: '', customDomain: '', tier: 'self-serve' },
  blog: [],
  events: [],
  specials: [],
  press: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useWizardStore = create<WizardStore>()(
  subscribeWithSelector((set, get) => ({
    screen: 'welcome',
    currentStep: 1,
    totalSteps: TOTAL_STEPS,
    schema: DEFAULT_SCHEMA,
    projectFilePath: null,
    isDirty: false,

    setScreen: (screen) => set({ screen }),

    goToStep: (step) =>
      set({ currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)) }),

    nextStep: () => {
      const { currentStep, totalSteps } = get();
      if (currentStep < totalSteps) set({ currentStep: currentStep + 1 });
      else set({ screen: 'export' });
    },

    prevStep: () => {
      const { currentStep } = get();
      if (currentStep > 1) set({ currentStep: currentStep - 1 });
      else set({ screen: 'welcome' });
    },

    initProject: (schema, filePath) =>
      set({
        schema,
        projectFilePath: filePath,
        isDirty: false,
        currentStep: 1,
        screen: 'wizard',
      }),

    updateSchema: (patch) =>
      set((state) => ({
        schema: deepMerge(state.schema, patch) as ProjectSchema,
        isDirty: true,
      })),

    setProjectFilePath: (path) => set({ projectFilePath: path }),

    markClean: () => set({ isDirty: false }),
  })),
);

// Tiny recursive merge — only plain objects are merged, arrays are replaced
function deepMerge(target: unknown, source: unknown): unknown {
  if (
    typeof source !== 'object' ||
    source === null ||
    typeof target !== 'object' ||
    target === null ||
    Array.isArray(source)
  ) {
    return source;
  }
  const result = { ...(target as Record<string, unknown>) };
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    result[k] = deepMerge(result[k], v);
  }
  return result;
}

// Utility type
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
