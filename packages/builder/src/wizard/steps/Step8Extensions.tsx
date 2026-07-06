import { useWizardStore } from '../../store/useWizardStore.js';
import styles from './Step.module.css';

export function Step8Extensions() {
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);
  const ext = schema.extensions ?? {};

  function setPlausible(enabled: boolean) {
    updateSchema({ extensions: { ...ext, analytics: { ...ext.analytics, plausible: { enabled, domain: ext.analytics?.plausible?.domain ?? '' } } } });
  }

  function setGa4(enabled: boolean) {
    updateSchema({ extensions: { ...ext, analytics: { ...ext.analytics, ga4: { enabled, measurementId: ext.analytics?.ga4?.measurementId ?? '' } } } });
  }

  function setToggle(key: keyof Omit<typeof ext, 'analytics' | 'cdnLibraries' | 'plugins'>, enabled: boolean) {
    updateSchema({ extensions: { ...ext, [key]: { ...(ext[key] as object), enabled } } });
  }

  const plausibleEnabled = ext.analytics?.plausible?.enabled ?? true;
  const ga4Enabled       = ext.analytics?.ga4?.enabled ?? false;

  const rows: Array<[keyof Omit<typeof ext, 'analytics' | 'cdnLibraries' | 'plugins'>, string, string]> = [
    ['reservations', 'Reservations',  'Reserve a slot for OpenTable, Resy, Toast, or a custom booking provider.'],
    ['emailCapture', 'Email capture', 'Show newsletter signup CTAs for specials, events, and updates.'],
    ['liveChat',     'Live chat',     'Reserve a body-end snippet slot for chat widgets or concierge tools.'],
    ['whatsapp',     'WhatsApp',      'Add a floating WhatsApp contact button for direct guest messaging.'],
  ];

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Extensions</h1>
        <p className={styles.subtitle}>Choose optional add-ons. You can change these any time and regenerate the site.</p>
      </header>

      <div className={styles.sectionLabel}>Analytics</div>
      <div className={styles.toggleGrid}>
        <label className={styles.toggleCard}>
          <div className={styles.toggleCardBody}>
            <div className={styles.toggleTitle}>Plausible Analytics</div>
            <div className={styles.toggleDescription}>Privacy-first, cookie-free analytics. On by default — no GDPR consent banner needed.</div>
          </div>
          <input type="checkbox" checked={plausibleEnabled}
            onChange={(e) => setPlausible(e.target.checked)} />
        </label>
        <label className={styles.toggleCard}>
          <div className={styles.toggleCardBody}>
            <div className={styles.toggleTitle}>Google Analytics 4</div>
            <div className={styles.toggleDescription}>Optional GA4 measurement ID. Requires a cookie consent banner — enable cookieBanner below.</div>
          </div>
          <input type="checkbox" checked={ga4Enabled}
            onChange={(e) => setGa4(e.target.checked)} />
        </label>
      </div>

      <div className={styles.sectionLabel}>Add-ons</div>
      <div className={styles.toggleGrid}>
        {rows.map(([key, title, description]) => {
          const val = ext[key] as { enabled?: boolean } | undefined;
          const checked = Boolean(val?.enabled);
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
