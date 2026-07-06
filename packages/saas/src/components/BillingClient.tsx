'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './BillingClient.module.css';

interface PlanMeta {
  id:           string;
  name:         string;
  price:        number;
  interval:     string | null;
  projectLimit: number;
  deployLimit:  number;
  customDomain: boolean;
  analytics:    boolean;
}

interface Props {
  currentPlanId:      string;
  periodEnd:          string | null;
  cancelAtPeriodEnd:  boolean;
  plans:              PlanMeta[];
}

export function BillingClient({ currentPlanId, periodEnd, cancelAtPeriodEnd, plans }: Props) {
  const pathname  = usePathname();
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : '';
  const [loading, setLoading] = useState<string | null>(null);
  const [error,   setError  ] = useState<string | null>(null);

  async function upgrade(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res  = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, returnUrl }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading('portal');
    setError(null);
    try {
      const res  = await fetch('/api/billing/portal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ returnUrl }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Portal failed.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  const isCurrent = (id: string) => id === currentPlanId;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Billing</h1>
        <p className={styles.subtitle}>
          Current plan: <strong>{plans.find((p) => p.id === currentPlanId)?.name ?? 'Free'}</strong>
          {periodEnd && (
            <span className={styles.periodEnd}>
              {cancelAtPeriodEnd ? ' · Cancels' : ' · Renews'} {new Date(periodEnd).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.planGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={[styles.planCard, isCurrent(plan.id) ? styles.planCurrent : ''].join(' ')}>
            {isCurrent(plan.id) && <div className={styles.currentBadge}>Current plan</div>}
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planPrice}>
              {plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(0)}`}
              {plan.interval && <span className={styles.planInterval}>/{plan.interval}</span>}
            </div>
            <ul className={styles.featureList}>
              <li>{plan.projectLimit} project{plan.projectLimit !== 1 ? 's' : ''}</li>
              <li>{plan.deployLimit} deploys/mo</li>
              <li>{plan.customDomain ? '✓' : '✗'} Custom domain</li>
              <li>{plan.analytics   ? '✓' : '✗'} Analytics</li>
            </ul>
            {isCurrent(plan.id) && currentPlanId !== 'free' ? (
              <button
                className={styles.portalBtn}
                onClick={openPortal}
                disabled={loading === 'portal'}
              >
                {loading === 'portal' ? 'Opening…' : 'Manage subscription'}
              </button>
            ) : !isCurrent(plan.id) && plan.price > 0 ? (
              <button
                className={styles.upgradeBtn}
                onClick={() => upgrade(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? 'Redirecting…' : `Upgrade to ${plan.name}`}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
