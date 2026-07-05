import { useWizardStore } from '../../store/useWizardStore.js';
import { StylePicker } from '../components/StylePicker.js';
import styles from './Step.module.css';

const STYLE_OPTIONS = [
  { id: 'hearth',   name: 'Hearth',   description: 'Warm editorial look with soft neutrals and serif display type.' },
  { id: 'canvas',   name: 'Canvas',   description: 'Minimal and bright with restrained typography and white space.' },
  { id: 'midnight', name: 'Midnight', description: 'Dark, moody presentation for premium brands.' },
  { id: 'market',   name: 'Market',   description: 'Fresh, casual, ingredient-forward visual language.' },
  { id: 'coast',    name: 'Coast',    description: 'Airy hospitality-forward design for seafood and beach towns.' },
  { id: 'ember',    name: 'Ember',    description: 'Bold contrast and firelit palette for steakhouses and grills.' },
] as const;

export function Step7Template() {
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);
  const ext = (schema.extensions ?? {}) as Record<string, unknown>;

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Template & Style</h1>
        <p className={styles.subtitle}>Choose the business type and design direction for the generated site.</p>
      </header>

      <label className={styles.choiceCard}>
        <span className={styles.choiceLabel}>Business type</span>
        <select value={schema.businessType}
          onChange={(e) => updateSchema({ businessType: e.target.value })}>
          <option value="restaurant">Restaurant</option>
          <option value="bakery">Bakery</option>
          <option value="cafe">Cafe</option>
          <option value="bar">Bar</option>
          <option value="food-truck">Food Truck</option>
        </select>
      </label>

      <StylePicker
        value={(ext?.theme as string) || 'hearth'}
        options={STYLE_OPTIONS}
        onChange={(theme) => updateSchema({ extensions: { ...ext, theme } })}
      />
    </section>
  );
}
