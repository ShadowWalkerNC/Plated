import { useWizardStore } from '../../store/useWizardStore.js';
import { StylePicker } from '../components/StylePicker.js';
import type { StyleTemplate, BusinessType } from '@plated/types';
import styles from './Step.module.css';

const STYLE_OPTIONS: Array<{ id: StyleTemplate; name: string; description: string }> = [
  { id: 'hearth',   name: 'Hearth',   description: 'Warm editorial look with soft neutrals and serif display type.' },
  { id: 'spark',    name: 'Spark',    description: 'Energetic and bold — high contrast for fast-casual and food trucks.' },
  { id: 'steel',    name: 'Steel',    description: 'Modern industrial aesthetic for bars, breweries, and upscale casual.' },
  { id: 'bloom',    name: 'Bloom',    description: 'Fresh, organic, ingredient-forward visual language for cafes and bakeries.' },
  { id: 'obsidian', name: 'Obsidian', description: 'Dark, moody presentation for premium and fine-dining brands.' },
  { id: 'ghost',    name: 'Ghost',    description: 'Minimal and clean — works with any palette, zero visual opinions.' },
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
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Template & Style</h1>
        <p className={styles.subtitle}>Choose the business type and design direction for the generated site.</p>
      </header>

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

      <StylePicker
        value={schema.styleTemplate ?? 'hearth'}
        options={STYLE_OPTIONS}
        onChange={(styleTemplate) => updateSchema({ styleTemplate })}
      />
    </section>
  );
}
