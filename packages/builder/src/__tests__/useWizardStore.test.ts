import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWizardStore } from '../store/useWizardStore.js';

beforeEach(() => {
  // Reset store to initial state between tests
  useWizardStore.setState(useWizardStore.getInitialState());
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
    // name should still be empty string default, not undefined
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
    // secondaryColor should be unchanged
    expect(result.current.schema.branding.secondaryColor).toBeDefined();
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
});
