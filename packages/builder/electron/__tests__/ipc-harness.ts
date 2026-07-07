/**
 * Shared test harness for IPC handler unit tests.
 *
 * makeIpc()    — fake IpcMain: captures handle() registrations, exposes
 *               invoke(channel, payload) to call them directly in tests.
 * makeDialog() — typed vi.fn() stubs for showSaveDialog / showOpenDialog.
 * makeShell()  — typed vi.fn() stubs for openExternal / showItemInFolder.
 * MINIMAL_SCHEMA — smallest valid ProjectSchema for fixtures.
 */
import { vi } from 'vitest';
import type { ProjectSchema } from '@plated/types';

// ---- Fake IpcMain -----------------------------------------------------------

type Handler = (event: null, ...args: unknown[]) => unknown;

export interface FakeIpc {
  handle: ReturnType<typeof vi.fn>;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

export function makeIpc(): FakeIpc {
  const handlers = new Map<string, Handler>();

  const handle = vi.fn((channel: string, fn: Handler) => {
    handlers.set(channel, fn);
  });

  async function invoke(channel: string, ...args: unknown[]): Promise<unknown> {
    const fn = handlers.get(channel);
    if (!fn) throw new Error(`No handler registered for channel: ${channel}`);
    return fn(null, ...args);
  }

  return { handle, invoke };
}

// ---- Fake Dialog ------------------------------------------------------------

export interface FakeDialog {
  showSaveDialog: ReturnType<typeof vi.fn>;
  showOpenDialog: ReturnType<typeof vi.fn>;
}

export function makeDialog(): FakeDialog {
  return {
    showSaveDialog: vi.fn(),
    showOpenDialog: vi.fn(),
  };
}

// ---- Fake Shell -------------------------------------------------------------

export interface FakeShell {
  openExternal:     ReturnType<typeof vi.fn>;
  showItemInFolder: ReturnType<typeof vi.fn>;
}

export function makeShell(): FakeShell {
  return {
    openExternal:     vi.fn().mockResolvedValue(undefined),
    showItemInFolder: vi.fn(),
  };
}

// ---- Minimal ProjectSchema fixture -----------------------------------------

export const MINIMAL_SCHEMA: ProjectSchema = {
  id:            'test-id',
  schemaVersion: '2.0',
  createdAt:     '2026-01-01T00:00:00.000Z',
  updatedAt:     '2026-01-01T00:00:00.000Z',
  businessType:  'restaurant',
  styleTemplate: 'hearth',
  colorTheme:    'default',
  darkMode:      false,
  business: {
    name:            'The Rusty Fork',
    tagline:         'Food worth driving for.',
    description:     '',
    phone:           '',
    email:           '',
    cuisineType:     '',
    existingWebsite: '',
  },
  branding: {
    logoUrl:          '',
    heroImageUrl:     '',
    heroVideoUrl:     '',
    primaryColor:     '#8a4b2f',
    secondaryColor:   '#f4ede4',
    accentColor:      '#c98f4a',
    faviconSourceUrl: '',
  },
  locations:            [],
  primaryLocationIndex: 0,
  menu:   { categories: [] },
  social: {
    facebook: '', instagram: '', twitter: '', tiktok: '', youtube: '',
    googleBusiness: '', yelp: '', tripadvisor: '', doordash: '',
    ubereats: '', grubhub: '', toast: '', chownow: '', opentable: '',
  },
  integrations: {},
  seo: {
    siteTitle: '', metaDescription: '', googleVerification: '',
    bingVerification: '', headSnippet: '', bodyStartSnippet: '', bodyEndSnippet: '',
  },
  extensions: {},
  deployment: { subdomain: '', customDomain: '' },
  blog: [], events: [], specials: [], press: [],
};
