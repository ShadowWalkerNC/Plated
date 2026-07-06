import { useEffect, useState } from 'react';
import { usePlated } from '../hooks/usePlated.js';
import { useWizardStore } from '../store/useWizardStore.js';
import type { GenerateResult } from '../hooks/usePlated.js';
import styles from './ExportScreen.module.css';

export function ExportScreen() {
  const plated = usePlated();
  const schema = useWizardStore((s) => s.schema);
  const setScreen = useWizardStore((s) => s.setScreen);
  const [outputDir, setOutputDir] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dryRunFiles, setDryRunFiles] = useState<number | null>(null);

  useEffect(() => {
    plated
      .generateDryRun(schema)
      .then((r) => setDryRunFiles(r.filesWritten))
      .catch(() => {});
  }, []);

  async function chooseDir() {
    const dir = await plated.pickOutputDir();
    if (dir) setOutputDir(dir);
  }

  async function runExport() {
    let dir = outputDir;
    if (!dir) {
      const picked = await plated.pickOutputDir();
      if (!picked) return;
      dir = picked;
      setOutputDir(dir);
    }
    setLoading(true);
    setError(null);
    try {
      const res = await plated.generate(schema, dir, true);
      if (!res.success) throw new Error(res.errors.join('\n') || 'Generation failed.');
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Ready to export</div>
        <h1 className={styles.title}>{schema.business.name || 'Untitled project'}</h1>
        <p className={styles.subtitle}>We’ll generate the full Astro site, content files, and site config bundle.</p>

        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Estimated files</span>
            <strong className={styles.statValue}>{dryRunFiles ?? '…'}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Business type</span>
            <strong className={styles.statValue}>{schema.businessType}</strong>
          </div>
        </div>

        <div className={styles.outputRow}>
          <input className={styles.outputInput} value={outputDir}
            onChange={(e) => setOutputDir(e.target.value)}
            placeholder="Choose export folder…" />
          <button className={styles.ghostBtn} type="button" onClick={chooseDir}>Browse</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!result ? (
          <div className={styles.actions}>
            <button className={styles.ghostBtn} type="button" onClick={() => setScreen('wizard')}>Back</button>
            <button className={styles.primaryBtn} type="button" onClick={runExport} disabled={loading}>
              {loading ? 'Generating…' : 'Generate Site'}
            </button>
          </div>
        ) : (
          <div className={styles.result}>
            <div className={styles.successTitle}>✅ Export complete</div>
            <div className={styles.resultMeta}>{result.filesWritten} files written to <code>{result.outputDir}</code></div>
            {result.warnings.length > 0 && (
              <ul className={styles.warnings}>
                {result.warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            )}
            <div className={styles.actions}>
              <button className={styles.ghostBtn} type="button" onClick={() => setScreen('wizard')}>Back to Wizard</button>
              <button className={styles.primaryBtn} type="button" onClick={() => plated.revealInFinder(result.outputDir)}>Reveal in Finder</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
