import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWizardStore, DEFAULT_SCHEMA } from '../store/useWizardStore.js';

beforeEach(() => {
  // Reset store to initial state between tests
  useWizardStore.setState({
    screen: 'welcome',
    currentStep: 1,
    schema: DEFAULT_SCHEMA,
    projectFilePath: null,
    isDirty: false,
  });
});

describe('useWizardStore — navigation', () => {
  it('starts on step 1', () => {
    const { result } = renderHook(() => useWizardStore((s) => s.currentStep));
    expect(result.current).toBe(1);
  });

  it('nextStep advances to step 2', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      step: s.currentStep,
      next: s.nextStep,
    })));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('prevStep does not go below step 1', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      step: s.currentStep,
      prev: s.prevStep,
    })));
    act(() => result.current.prev());
    expect(result.current.step).toBe(1);
  });

  it('goToStep sets step directly', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      step: s.currentStep,
      go: s.goToStep,
    })));
    act(() => result.current.go(5));
    expect(result.current.step).toBe(5);
  });

  it('goToStep clamps at totalSteps (8)', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      step: s.currentStep,
      go: s.goToStep,
    })));
    act(() => result.current.go(99));
    expect(result.current.step).toBe(8);
  });

  it('nextStep on step 8 transitions to export screen', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      screen: s.screen,
      go: s.goToStep,
      next: s.nextStep,
    })));
    act(() => result.current.go(8));
    act(() => result.current.next());
    expect(result.current.screen).toBe('export');
  });

  it('prevStep on step 1 transitions back to welcome screen', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      screen: s.screen,
      prev: s.prevStep,
    })));
    act(() => result.current.prev());
    expect(result.current.screen).toBe('welcome');
  });
});

describe('useWizardStore — schema updates', () => {
  it('updateSchema merges business name', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      schema: s.schema,
      update: s.updateSchema,
    })));
    act(() => result.current.update({ business: { name: 'Hearth & Vine' } }));
    expect(result.current.schema.business.name).toBe('Hearth & Vine');
  });

  it('updateSchema does not wipe sibling fields', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      schema: s.schema,
      update: s.updateSchema,
    })));
    act(() => result.current.update({ business: { tagline: 'Good food.' } }));
    expect(result.current.schema.business.name).toBeDefined();
  });

  it('updateSchema sets isDirty true', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      dirty: s.isDirty,
      update: s.updateSchema,
    })));
    act(() => result.current.update({ business: { name: 'Test' } }));
    expect(result.current.dirty).toBe(true);
  });

  it('updateSchema deep merges branding', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      schema: s.schema,
      update: s.updateSchema,
    })));
    act(() => result.current.update({ branding: { primaryColor: '#ff0000' } }));
    expect(result.current.schema.branding.primaryColor).toBe('#ff0000');
    expect(result.current.schema.branding.secondaryColor).toBeDefined();
  });

  it('updateSchema replaces arrays (not merges)', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      schema: s.schema,
      update: s.updateSchema,
    })));
    const newCategories = [{ id: 'c1', name: 'Starters', displayOrder: 0, items: [] }];
    act(() => result.current.update({ menu: { categories: newCategories } }));
    expect(result.current.schema.menu.categories).toHaveLength(1);
    expect(result.current.schema.menu.categories[0].name).toBe('Starters');
  });

  it('markClean resets isDirty to false', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      dirty: s.isDirty,
      update: s.updateSchema,
      clean: s.markClean,
    })));
    act(() => result.current.update({ business: { name: 'Dirty' } }));
    expect(result.current.dirty).toBe(true);
    act(() => result.current.clean());
    expect(result.current.dirty).toBe(false);
  });

  it('initProject loads schema and sets screen to wizard', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      screen: s.screen,
      schema: s.schema,
      dirty: s.isDirty,
      init: s.initProject,
    })));
    const loaded = { ...DEFAULT_SCHEMA, business: { ...DEFAULT_SCHEMA.business, name: 'Loaded Place' } };
    act(() => result.current.init(loaded, '/path/to/project.json'));
    expect(result.current.screen).toBe('wizard');
    expect(result.current.schema.business.name).toBe('Loaded Place');
    expect(result.current.dirty).toBe(false);
  });
});

describe('useWizardStore — screen', () => {
  it('starts on welcome screen', () => {
    const { result } = renderHook(() => useWizardStore((s) => s.screen));
    expect(result.current).toBe('welcome');
  });

  it('setScreen transitions to wizard', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      screen: s.screen,
      set: s.setScreen,
    })));
    act(() => result.current.set('wizard'));
    expect(result.current.screen).toBe('wizard');
  });

  it('setScreen transitions to export', () => {
    const { result } = renderHook(() => useWizardStore((s) => ({
      screen: s.screen,
      set: s.setScreen,
    })));
    act(() => result.current.set('export'));
    expect(result.current.screen).toBe('export');
  });
});

describe('useWizardStore — DEFAULT_SCHEMA shape', () => {
  it('DEFAULT_SCHEMA has a valid schemaVersion', () => {
    expect(DEFAULT_SCHEMA.schemaVersion).toBe('2.0');
  });

  it('DEFAULT_SCHEMA has required top-level fields', () => {
    expect(DEFAULT_SCHEMA.id).toBeTruthy();
    expect(DEFAULT_SCHEMA.styleTemplate).toBe('hearth');
    expect(DEFAULT_SCHEMA.colorTheme).toBe('default');
    expect(typeof DEFAULT_SCHEMA.darkMode).toBe('boolean');
  });

  it('DEFAULT_SCHEMA integrations is an object', () => {
    expect(typeof DEFAULT_SCHEMA.integrations).toBe('object');
  });

  it('DEFAULT_SCHEMA menu has no syncSource field', () => {
    expect((DEFAULT_SCHEMA.menu as Record<string, unknown>).syncSource).toBeUndefined();
  });

  it('DEFAULT_SCHEMA deployment has no tier field', () => {
    expect((DEFAULT_SCHEMA.deployment as Record<string, unknown>).tier).toBeUndefined();
  });

  it('DEFAULT_SCHEMA branding uses faviconSourceUrl not faviconUrl', () => {
    expect((DEFAULT_SCHEMA.branding as Record<string, unknown>).faviconUrl).toBeUndefined();
    expect(DEFAULT_SCHEMA.branding.faviconSourceUrl).toBeDefined();
  });

  it('DEFAULT_SCHEMA business uses existingWebsite not existingWebsiteUrl', () => {
    expect((DEFAULT_SCHEMA.business as Record<string, unknown>).existingWebsiteUrl).toBeUndefined();
    expect(DEFAULT_SCHEMA.business.existingWebsite).toBeDefined();
  });
});
