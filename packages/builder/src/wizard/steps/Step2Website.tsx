import { Field } from '../components/Field.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import styles from './Step.module.css';

export function Step2Website() {
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Existing Website</h1>
        <p className={styles.subtitle}>If you already have a site, we can use it as a migration reference.</p>
      </header>

      <Field label="Current website URL" hint="Optional. Leave blank if this is a new launch.">
        <input
          value={schema.business.existingWebsiteUrl}
          onChange={(e) => updateSchema({ business: { existingWebsiteUrl: e.target.value } })}
          placeholder="https://www.example.com"
        />
      </Field>

      <div className={styles.noteCard}>
        <h2 className={styles.noteTitle}>How this helps</h2>
        <ul className={styles.noteList}>
          <li>Recreate page structure and navigation.</li>
          <li>Reuse menu, events, and contact content as a baseline.</li>
          <li>Preserve important SEO details during migration.</li>
        </ul>
      </div>
    </section>
  );
}
