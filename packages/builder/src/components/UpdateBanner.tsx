import { useUpdater } from '../hooks/useUpdater';
import styles         from './UpdateBanner.module.css';

export function UpdateBanner() {
  const { state, checkNow, installNow } = useUpdater();

  if (state.status === 'idle' || state.status === 'not-available') return null;

  const msgs: Record<string, string> = {
    checking:     'Checking for updates…',
    available:    `Update ${state.version ?? ''} available — downloading…`,
    downloading:  `Downloading update… ${state.progress ?? 0}%`,
    downloaded:   `Update ${state.version ?? ''} ready. Restart to install.`,
    error:        `Update error: ${state.error}`,
  };

  return (
    <div className={[styles.banner, styles[state.status]].join(' ')}>
      <span className={styles.msg}>{msgs[state.status] ?? ''}</span>
      {state.status === 'downloaded' && (
        <button className={styles.btn} onClick={installNow}>
          Restart &amp; Install
        </button>
      )}
      {state.status === 'error' && (
        <button className={styles.btn} onClick={checkNow}>
          Retry
        </button>
      )}
    </div>
  );
}
