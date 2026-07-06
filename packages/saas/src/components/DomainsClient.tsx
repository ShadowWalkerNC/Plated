'use client';

import { useState } from 'react';
import styles from './DomainsClient.module.css';

interface DomainRow {
  id:                string;
  domain:            string;
  verified:          boolean;
  verificationToken: string;
  createdAt:         string;
}

interface Props {
  projectId:     string;
  domains:       DomainRow[];
  canAdd:        boolean;
  upgradeReason: string | null;
}

export function DomainsClient({ projectId, domains: initial, canAdd, upgradeReason }: Props) {
  const [domains, setDomains] = useState<DomainRow[]>(initial);
  const [input,   setInput  ] = useState('');
  const [busy,    setBusy   ] = useState<string | null>(null);
  const [error,   setError  ] = useState<string | null>(null);

  async function addDomain() {
    if (!input.trim()) return;
    setBusy('add'); setError(null);
    try {
      const res  = await fetch(`/api/projects/${projectId}/domains`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domain: input.trim() }),
      });
      const data = await res.json() as { domain?: DomainRow; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to add domain');
      setDomains((d) => [...d, data.domain!]);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally { setBusy(null); }
  }

  async function verify(id: string) {
    setBusy(id); setError(null);
    try {
      const res  = await fetch(`/api/projects/${projectId}/domains/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domainId: id }),
      });
      const data = await res.json() as { verified: boolean; reason?: string };
      if (data.verified) {
        setDomains((d) => d.map((row) => row.id === id ? { ...row, verified: true } : row));
      } else {
        setError(data.reason ?? 'Verification failed. Check your DNS record and try again.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally { setBusy(null); }
  }

  async function remove(id: string) {
    setBusy(id); setError(null);
    try {
      await fetch(`/api/projects/${projectId}/domains`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domainId: id }),
      });
      setDomains((d) => d.filter((row) => row.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally { setBusy(null); }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Custom Domains</h1>
      <p className={styles.sub}>Point your own domain to this project. Requires DNS access.</p>

      {upgradeReason && (
        <div className={styles.upgradeBanner}>
          🔒 {upgradeReason} <a href="/dashboard/billing" className={styles.upgradeLink}>Upgrade →</a>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {canAdd && (
        <div className={styles.addRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. menu.myrestaurant.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDomain()}
          />
          <button className={styles.addBtn} onClick={addDomain} disabled={busy === 'add' || !input.trim()}>
            {busy === 'add' ? 'Adding…' : 'Add domain'}
          </button>
        </div>
      )}

      {domains.length === 0 && (
        <p className={styles.empty}>No custom domains yet.</p>
      )}

      <ul className={styles.list}>
        {domains.map((d) => (
          <li key={d.id} className={styles.domainRow}>
            <div className={styles.domainMain}>
              <span className={styles.domainName}>{d.domain}</span>
              <span className={[styles.badge, d.verified ? styles.verified : styles.pending].join(' ')}>
                {d.verified ? '✓ Verified' : 'Pending'}
              </span>
            </div>

            {!d.verified && (
              <div className={styles.instructions}>
                <p className={styles.instrLabel}>Add this DNS TXT record to verify ownership:</p>
                <div className={styles.dnsRecord}>
                  <div className={styles.dnsRow}>
                    <span className={styles.dnsKey}>Host</span>
                    <code className={styles.dnsVal}>_plated.{d.domain}</code>
                  </div>
                  <div className={styles.dnsRow}>
                    <span className={styles.dnsKey}>Value</span>
                    <code className={styles.dnsVal}>plated-verify={d.verificationToken}</code>
                  </div>
                  <div className={styles.dnsRow}>
                    <span className={styles.dnsKey}>TTL</span>
                    <code className={styles.dnsVal}>300</code>
                  </div>
                </div>
                <p className={styles.hint}>Also add a <strong>CNAME</strong> record: <code>{d.domain}</code> → <code>cname.plated.io</code></p>
                <button
                  className={styles.verifyBtn}
                  onClick={() => verify(d.id)}
                  disabled={busy === d.id}
                >
                  {busy === d.id ? 'Checking…' : 'Verify DNS'}
                </button>
              </div>
            )}

            <button
              className={styles.removeBtn}
              onClick={() => remove(d.id)}
              disabled={busy === d.id}
              aria-label={`Remove ${d.domain}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
