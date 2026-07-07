import { Field }          from '../components/Field.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import type { BusinessType } from '@plated/types';
import styles from './Step2Website.module.css';
import stepStyles from './Step.module.css';

// ---- Business type definitions ----------------------------------------------

const BUSINESS_TYPES: Array<{
  value:       BusinessType;
  label:       string;
  icon:        string;
  description: string;
}> = [
  {
    value:       'restaurant',
    label:       'Restaurant',
    icon:        '🍽️',
    description: 'Full-service dining with a defined menu and sit-down experience.',
  },
  {
    value:       'food-truck',
    label:       'Food Truck',
    icon:        '🚚',
    description: 'Mobile kitchen with rotating locations and a streamlined menu.',
  },
  {
    value:       'bar',
    label:       'Bar',
    icon:        '🍸',
    description: 'Drinks-forward venue — cocktail bar, wine bar, taproom, or pub.',
  },
  {
    value:       'cafe',
    label:       'Cafe',
    icon:        '☕',
    description: 'Coffee shop, tea house, or light-bites café with daytime hours.',
  },
  {
    value:       'bakery',
    label:       'Bakery',
    icon:        '🥐',
    description: 'Bread, pastry, or specialty baked goods — retail or wholesale.',
  },
  {
    value:       'catering',
    label:       'Catering',
    icon:        '🤵',
    description: 'Event catering and private dining — inquiry-led rather than walk-in.',
  },
  {
    value:       'food-stand',
    label:       'Food Stand',
    icon:        '🏪',
    description: 'Counter, kiosk, or market stall with a focused, short menu.',
  },
  {
    value:       'ghost-kitchen',
    label:       'Ghost Kitchen',
    icon:        '👻',
    description: 'Delivery-only kitchen — no dine-in, built for app-based ordering.',
  },
];

// ---- Component --------------------------------------------------------------

export function Step2Website() {
  const schema       = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  const selected      = schema.businessType;
  const existingUrl   = schema.business.existingWebsite ?? '';
  const hasMigration  = existingUrl.trim().length > 0;

  return (
    <section className={stepStyles.step}>
      <header className={stepStyles.header}>
        <h1 className={stepStyles.title}>Business Type</h1>
        <p className={stepStyles.subtitle}>
          Choose what best describes your business. This shapes your page
          structure, default sections, and navigation.
        </p>
      </header>

      {/* ── Business type card grid ─────────────────────────────────────── */}
      <div className={styles.typeGrid} role="radiogroup" aria-label="Business type">
        {BUSINESS_TYPES.map((bt) => {
          const isActive = bt.value === selected;
          return (
            <button
              key={bt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={[
                styles.typeCard,
                isActive ? styles.typeCardActive : '',
              ].join(' ')}
              onClick={() => updateSchema({ businessType: bt.value })}
            >
              <span className={styles.typeIcon} aria-hidden="true">{bt.icon}</span>
              <span className={styles.typeName}>{bt.label}</span>
              <span className={styles.typeDescription}>{bt.description}</span>
            </button>
          );
        })}
      </div>

      {/* ── Existing website URL ────────────────────────────────────────── */}
      <Field
        label="Current website URL"
        hint="Optional. Leave blank if this is a new launch."
      >
        <input
          type="url"
          value={existingUrl}
          onChange={(e) => updateSchema({ business: { existingWebsite: e.target.value } })}
          placeholder="https://www.example.com"
        />
      </Field>

      {/* ── Contextual note card ────────────────────────────────────────── */}
      {hasMigration ? (
        <div className={stepStyles.noteCard}>
          <h2 className={stepStyles.noteTitle}>Migrating from an existing site</h2>
          <ul className={stepStyles.noteList}>
            <li>Your current URL is saved — we'll use it as a reference baseline.</li>
            <li>Recreate page structure, navigation, and menu content.</li>
            <li>Preserve important SEO signals during the switch.</li>
          </ul>
        </div>
      ) : (
        <div className={stepStyles.noteCard}>
          <h2 className={stepStyles.noteTitle}>New launch</h2>
          <ul className={stepStyles.noteList}>
            <li>We'll build your site from scratch based on your inputs.</li>
            <li>Your business type determines the default page layout.</li>
            <li>You can always add more pages and sections in the editor.</li>
          </ul>
        </div>
      )}
    </section>
  );
}
