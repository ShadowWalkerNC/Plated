'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/db/schema';
import styles from './DeployPanel.module.css';

interface DeployResult {
  ok: boolean;
  deploymentId?: string;
  filesWritten?: number;
  warnings?: string[];
  deployUrl?: string;
  error?: string;
}

interface Props { project: Project }

const PROVIDERS = [
  { id: 'vercel',    label: 'Vercel',           description: 'Deploy to Vercel via the Deploy API. Instant global CDN.' },
  { id: 'netlify',   label: 'Netlify',           description: 'Push to Netlify Sites API. Atomic deploys with instant rollback.' },
  { id: 'download',  label: 'Download ZIP',      description: 'Download the generated Astro project and deploy anywhere.' },
] as const;

type Provider = typeof PROVIDERS[number]['id'];

export function DeployPanel({ project }: Props) {
  const [provider, setProvider]   = useState<Provider>('vercel');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<DeployResult | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function deploy() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (provider === 'download') {
        const res = await fetch(`/api/projects/${project.id}/download`);
        if (!res.ok) throw new Error('Download failed.');
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${project.slug || project.id}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        setResult({ ok: true });
      } else {
        const res  = await fetch(`/api/projects/${project.id}/deploy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider }),
        });
        const data = await res.json() as DeployResult;
        if (!res.ok) throw new Error(data.error ?? 'Deploy failed.');
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard">Projects</Link>
            <span>/</span>
            <Link href={`/dashboard/projects/${project.id}`}>{project.name}</Link>
            <span>/</span>
            <span>Deploy</span>
          </div>
          <h1 className={styles.title}>Deploy</h1>
        </div>
      </div>

      <div className={styles.providerGrid}>
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            className={[styles.providerCard, provider === p.id ? styles.providerActive : ''].join(' ')}
            onClick={() => setProvider(p.id)}
            type="button"
          >
            <div className={styles.providerLabel}>{p.label}</div>
            <div className={styles.providerDesc}>{p.description}</div>
          </button>
        ))}
      </div>

      {provider === 'vercel' && (
        <div className={styles.infoCard}>
          <strong>Required:</strong> Set <code>VERCEL_TOKEN</code> and <code>VERCEL_TEAM_ID</code> (optional) in your environment.
          The API will create a new Vercel project named <code>{project.slug}</code> and deploy the generated files.
        </div>
      )}

      {provider === 'netlify' && (
        <div className={styles.infoCard}>
          <strong>Required:</strong> Set <code>NETLIFY_TOKEN</code> in your environment.
          The API will create a new Netlify site and push all generated files atomically.
        </div>
      )}

      {error  && <div className={styles.error}>{error}</div>}

      {result?.ok && (
        <div className={styles.success}>
          {result.deployUrl ? (
            <>
              <div className={styles.successTitle}>🚀 Deployed</div>
              <a href={result.deployUrl} target="_blank" rel="noreferrer" className={styles.deployUrl}>{result.deployUrl}</a>
            </>
          ) : provider === 'download' ? (
            <div className={styles.successTitle}>✅ ZIP downloaded</div>
          ) : (
            <div className={styles.successTitle}>✅ Build complete — {result.filesWritten} files written</div>
          )}
          {(result.warnings ?? []).length > 0 && (
            <ul className={styles.warnings}>{result.warnings!.map((w) => <li key={w}>{w}</li>)}</ul>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Link href={`/dashboard/projects/${project.id}`} className={styles.backBtn}>Back</Link>
        <button className={styles.deployBtn} onClick={deploy} disabled={loading}>
          {loading ? 'Working…' : provider === 'download' ? 'Download ZIP' : `Deploy to ${PROVIDERS.find((p) => p.id === provider)!.label}`}
        </button>
      </div>
    </div>
  );
}
