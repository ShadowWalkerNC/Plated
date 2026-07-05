'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DeleteProjectButton.module.css';

interface Props {
  projectId: string;
  projectName: string;
}

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project.');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      {!confirming ? (
        <button className={styles.deleteBtn} type="button" onClick={() => setConfirming(true)}>
          Delete project
        </button>
      ) : (
        <div className={styles.confirmBox}>
          <p className={styles.confirmText}>
            Delete <strong>{projectName}</strong>? This cannot be undone.
          </p>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.confirmActions}>
            <button className={styles.cancelBtn} type="button" onClick={() => setConfirming(false)}>Cancel</button>
            <button className={styles.confirmDeleteBtn} type="button" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
