import { useNetwork } from '../hooks/useNetwork';
import styles         from './OfflineBadge.module.css';

export function OfflineBadge() {
  const { online } = useNetwork();
  if (online) return null;
  return (
    <div className={styles.badge} role="status" aria-live="polite">
      <span className={styles.dot} />
      Offline — changes save locally
    </div>
  );
}
