import { useWizardStore } from '../../store/useWizardStore.js';
import { StylePicker }    from '../components/StylePicker.js';
import type { StyleTemplate, BusinessType, ColorTheme } from '@plated/types';
import styles from './Step.module.css';

/**
 * STYLE_OPTIONS — must stay in sync with:
 *   - packages/generator/src/themeRegistry.ts (THEME_REGISTRY)
 *   - packages/types/src/template.ts (StyleTemplate)
 *   - styles/<id>/variables.css (on-disk CSS)
 */
const STYLE_OPTIONS: Array<{
  id:          StyleTemplate;
  name:        string;
  description: string;
  mode:        'light' | 'dark';
  swatches:    { default: string; warm: string; cool: string };
}> = [
  {
    id:          'hearth',
    name:        'Hearth',
    description: 'Warm editorial look with soft amber backgrounds and serif display type.',
    mode:        'light',
    swatches:    { default: '#c8622a', warm: '#8b2200', cool: '#3a6e2c' },
  },
  {
    id:          'canvas',
    name:        'Canvas',
    description: 'Clean and minimal — a neutral base that lets your photos and copy lead.',
    mode:        'light',
    swatches:    { default: '#2563eb', warm: '#d97706', cool: '#0d9488' },
  },
  {
    id:          'midnight',
    name:        'Midnight',
    description: 'Dark and premium — deep backgrounds with gold, copper, or silver accents.',
    mode:        'dark',
    swatches:    { default: '#c8a84a', warm: '#b86a2a', cool: '#8ab0d4' },
  },
  {
    id:          'market',
    name:        'Market',
    description: 'Fresh and ingredient-forward — botanical greens and natural earthy tones.',
    mode:        'light',
    swatches:    { default: '#3a7a2c', warm: '#c88a10', cool: '#7c3aac' },
  },
  {
    id:          'coast',
    name:        'Coast',
    description: 'Airy and bright — white and sky-blue palette with a welcoming hospitality feel.',
    mode:        'light',
    swatches:    { default: '#1a6ea8', warm: '#d04a28', cool: '#1a8c60' },
  },
  {
    id:          'ember',
    name:        'Ember',
    description: 'Bold and dramatic — near-black backgrounds with fire-orange or crimson accents.',
    mode:        'dark',
    swatches:    { default: '#e8581a', warm: '#c0200a', cool: '#d4b800' },
  },
];

const VARIANT_OPTIONS: Array<{ value: ColorTheme; label: string; hint: string }> = [
  { value: 'default', label: 'Default', hint: 'The theme as designed.' },
  { value: 'warm',    label: 'Warm',    hint: 'Shifts accents toward warmer tones.' },
  { value: 'cool',    label: 'Cool',    hint: 'Shifts accents toward cooler tones.' },
];

const BUSINESS_TYPE_OPTIONS: Array<{ value: BusinessType; label: string }> = [
  { value: 'restaurant',    label: 'Restaurant' },
  { value: 'food-truck',    label: 'Food Truck' },
  { value: 'bar',           label: 'Bar' },
  { value: 'cafe',          label: 'Cafe' },
  { value: 'bakery',        label: 'Bakery' },
  { value: 'catering',      label: 'Catering' },
  { value: 'food-stand',    label: 'Food Stand' },
  { value: 'ghost-kitchen', label: 'Ghost Kitchen' },
];

export function Step7Template() {
  const schema       = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Template &amp; Style</h1>
        <p className={styles.subtitle}>
          Choose the business type, design direction, and colour variant for your site.
        </p>
      </header>

      {/* ── Business type ──────────────────────────────────── */}
      <label className={styles.choiceCard}>
        <span className={styles.choiceLabel}>Business type</span>
        <select
          value={schema.businessType}
          onChange={(e) => updateSchema({ businessType: e.target.value as BusinessType })}
        >
          {BUSINESS_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      {/* ── Style picker ───────────────────────────────────── */}
      <StylePicker
        value={schema.styleTemplate ?? 'hearth'}
        options={STYLE_OPTIONS}
        onChange={(styleTemplate) => updateSchema({ styleTemplate })}
      />

      {/* ── Variant picker ─────────────────────────────────── */}
      <fieldset className={styles.variantGroup}>
        <legend className={styles.choiceLabel}>Colour variant</legend>
        {VARIANT_OPTIONS.map((opt) => (
          <label key={opt.value} className={styles.variantCard}>
            <input
              type="radio"
              name="colorTheme"
              value={opt.value}
              checked={(schema.colorTheme ?? 'default') === opt.value}
              onChange={() => updateSchema({ colorTheme: opt.value })}
            />
            <span className={styles.variantLabel}>{opt.label}</span>
            <span className={styles.variantHint}>{opt.hint}</span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
