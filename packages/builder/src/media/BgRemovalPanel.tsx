/**
 * BgRemovalPanel
 *
 * Calls window.plated.removeBackground(imagePath) via IPC.
 * The IPC handler runs @imgly/background-removal in the main process.
 *
 * Shows:
 *   - Original image (left)
 *   - Result image once ready (right), with a spinner while processing
 *   - Download button (saves the result PNG via IPC)
 *   - "Use this image" button to emit the result
 *
 * Props:
 *   src            — absolute file path of the source image
 *   onConfirm(url) — called with the result blob URL
 *   onClose()      — close the panel
 */
import { useState } from 'react';
import { usePlated } from '../hooks/usePlated.js';
import styles from './BgRemovalPanel.module.css';

export interface BgRemovalPanelProps {
  src: string;
  onConfirm: (url: string) => void;
  onClose: () => void;
}

export function BgRemovalPanel({ src, onConfirm, onClose }: BgRemovalPanelProps) {
  const plated = usePlated();
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleRemove() {
    setProcessing(true);
    setError(null);
    try {
      const res = await plated.removeBackground(src);
      if (!res.ok) throw new Error(res.reason ?? 'Background removal failed');
      setResultUrl(res.resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSave() {
    if (!resultUrl) return;
    await plated.saveFile({ defaultPath: 'logo-transparent.png', filters: [{ name: 'PNG', extensions: ['png'] }] });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Remove background</span>
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
      </div>

      <div className={styles.compareRow}>
        <div className={styles.imgWrap}>
          <span className={styles.imgLabel}>Original</span>
          <img className={styles.img} src={src.startsWith('/') ? `file://${src}` : src} alt="Original" />
        </div>

        <div className={styles.imgWrap}>
          <span className={styles.imgLabel}>Result</span>
          {processing && <div className={styles.spinner} />}
          {!processing && resultUrl && (
            <img className={styles.img} src={resultUrl} alt="Background removed" />
          )}
          {!processing && !resultUrl && (
            <div className={styles.placeholder}>Result appears here</div>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {!resultUrl && (
          <button
            className={styles.primaryBtn}
            onClick={() => void handleRemove()}
            disabled={processing}
            type="button"
          >
            {processing ? 'Processing…' : 'Remove background'}
          </button>
        )}
        {resultUrl && (
          <>
            <button className={styles.secondaryBtn} onClick={() => void handleSave()} type="button">
              Download PNG
            </button>
            <button className={styles.primaryBtn} onClick={() => onConfirm(resultUrl)} type="button">
              Use this image
            </button>
          </>
        )}
        <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
      </div>
    </div>
  );
}
