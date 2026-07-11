import { useState }    from 'react';
import { useExport }   from '../hooks/useExport';
import { useNetwork }  from '../hooks/useNetwork';
import type { ProjectSchema } from '@plated/types';
import styles from './ExportPanel.module.css';

interface Props { schema: ProjectSchema; }

export function ExportPanel({ schema }: Props) {
  const { online }              = useNetwork();
  const { exporting, lastResult, exportZip, exportFolder } = useExport();
  const [mode, setMode] = useState<'zip' | 'folder'>('zip');

  async function handleExport() {
    if (mode === 'zip')    await exportZip(schema);
    else                   await exportFolder(schema);
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Export</h2>
      <p className={styles.sub}>Build a complete Astro project from your schema and save it locally.</p>

      <div className={styles.modeRow}>
        <button
          className={[styles.modeBtn, mode === 'zip' ? styles.active : ''].join(' ')}
          onClick={() => setMode('zip')}
        >
          📦 ZIP archive
        </button>
        <button
          className={[styles.modeBtn, mode === 'folder' ? styles.active : ''].join(' ')}
          onClick={() => setMode('folder')}
        >
          📁 Folder
        </button>
      </div>

      {mode === 'zip' && (
        <p className={styles.hint}>Saves a single <code>.zip</code> you can upload anywhere.</p>
      )}
      {mode === 'folder' && (
        <p className={styles.hint}>Writes a full Astro project you can <code>npm run dev</code> immediately.</p>
      )}

      {!online && (
        <div className={styles.offlineNote}>
          ⚠️ You’re offline. Local export still works — cloud deploy requires a connection.
        </div>
      )}

      <button
        className={styles.exportBtn}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting…' : mode === 'zip' ? 'Save ZIP' : 'Choose Folder & Export'}
      </button>

      {lastResult && (
        <div className={[styles.result, lastResult.ok ? styles.ok : styles.fail].join(' ')}>
          {lastResult.ok
            ? `✓ Saved to ${lastResult.filePath}${lastResult.filesWritten ? ` (${lastResult.filesWritten} files)` : ''}`
            : `✗ ${lastResult.reason ?? 'Export failed'}`}
        </div>
      )}
    </div>
  );
}
