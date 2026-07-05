// Welcome screen — shown at launch
// Options: New project, Open recent, Open file
import { useState, useEffect } from 'react';
import { useWizardStore } from '../store/useWizardStore.js';
import { useNexcms } from '../hooks/useNexcms.js';
import { createDefaultSchema } from './defaultSchema.js';
import styles from './Welcome.module.css';

export function Welcome() {
  const { initProject } = useWizardStore();
  const nexcms = useNexcms();
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    nexcms.getRecentProjects().then(setRecentProjects).catch(() => {});
  }, []);

  async function handleNew() {
    const filePath = await nexcms.saveFile({
      defaultPath: 'project.nexcms.json',
      filters: [{ name: 'NexCMS Project', extensions: ['json'] }],
    });
    if (!filePath) return;
    const schema = createDefaultSchema('');
    await nexcms.saveProject(schema, filePath);
    initProject(schema, filePath);
  }

  async function handleOpen() {
    const filePath = await nexcms.pickFile({
      filters: [{ name: 'NexCMS Project', extensions: ['json'] }],
    });
    if (!filePath) return;
    try {
      const schema = await nexcms.loadProject(filePath);
      initProject(schema, filePath);
    } catch (err) {
      setError(`Could not open project: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleOpenRecent(filePath: string) {
    try {
      const schema = await nexcms.loadProject(filePath);
      initProject(schema, filePath);
    } catch (err) {
      setError(`Could not open project: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div className={styles.welcome}>
      <div className={styles.hero}>
        <div className={styles.logo}>NexCMS</div>
        <p className={styles.tagline}>The hospitality website builder.</p>
        <p className={styles.sub}>Built for chefs, not developers.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleNew}>
          + New Project
        </button>
        <button className={styles.btnSecondary} onClick={handleOpen}>
          Open Project File
        </button>
      </div>

      {recentProjects.length > 0 && (
        <div className={styles.recent}>
          <h2 className={styles.recentHeading}>Recent Projects</h2>
          <ul className={styles.recentList}>
            {recentProjects.map((fp) => (
              <li key={fp}>
                <button
                  className={styles.recentItem}
                  onClick={() => handleOpenRecent(fp)}
                  title={fp}
                >
                  <span className={styles.recentName}>{fp.split('/').pop()}</span>
                  <span className={styles.recentPath}>{fp}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
          <button className={styles.errorDismiss} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <footer className={styles.footer}>
        <span>NexCMS v0.0.0</span>
        <span>·</span>
        <span>Built for chefs, not developers.</span>
      </footer>
    </div>
  );
}
