import type { BuilderAccentPreset, BuilderThemeConfig } from '@plated/types';

/** Default Local Builder chrome theme. */
export const DEFAULT_BUILDER_THEME: BuilderThemeConfig = {
  accent: 'ember',
  radius: 0.625,
  colorMode: 'system',
  density: 'comfortable',
};

/** Hex values for named accent presets (light mode). */
export const BUILDER_ACCENT_HEX: Record<Exclude<BuilderAccentPreset, 'custom'>, string> = {
  ember: '#8a4b2f',
  ink: '#1e1a17',
  gold: '#c98f4a',
};
