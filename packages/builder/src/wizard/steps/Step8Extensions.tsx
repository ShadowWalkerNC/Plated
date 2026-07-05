import { useWizardStore } from '../../store/useWizardStore.js';
import styles from './Step.module.css';

export function Step8Extensions() {
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);
  const ext = (schema.extensions ?? {}) as Record<string, unknown>;

  function setToggle(key: string, enabled: boolean) {
    updateSchema({ extensions: { ...ext, [key]: { enabled } } });
  }

  const rows: Array<[string, string, string]> = [
    ['googleAnalytics', 'Google Analytics 4', 'Install a GA4 measurement ID later and track visits and conversions.'],
    ['reservations',    'Reservations',       'Reserve a slot for OpenTable, Resy, Toast, or a custom booking provider.'],
    ['emailCapture',    'Email capture',      'Show newsletter signup CTAs for specials, events, and updates.'],
    ['liveChat',        'Live chat',          'Reserve a body-end snippet slot for chat widgets or concierge tools.'],
  ];

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Extensions</h1>
        <p className={styles.subtitle}>Choose optional add-ons. You can change these any time and regenerate the site.</p>
      </header>

      <div className={styles.toggleGrid}>
        {rows.map(([key, title, description]) => {
          const checked = Boolean((ext[key] as { enabled?: boolean })?.enabled);
          return (
            <label key={key} className={styles.toggleCard}>
              <div className={styles.toggleCardBody}>
                <div className={styles.toggleTitle}>{title}</div>
                <div className={styles.toggleDescription}>{description}</div>
              </div>
              <input type="checkbox" checked={checked}
                onChange={(e) => setToggle(key, e.target.checked)} />
            </label>
          );
        })}
      </div>
    </section>
  );
}
