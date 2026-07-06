'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './OnboardingWizard.module.css';

type ThemeId = 'hearth' | 'spark' | 'steel';

interface WizardData {
  restaurantName: string;
  cuisine: string;
  city: string;
  description: string;
  theme: ThemeId;
  wantsReservations: boolean;
  wantsOnlineOrdering: boolean;
  primaryCta: 'book' | 'order' | 'call' | 'visit';
}

const STEPS = ['Basics', 'Brand', 'Conversion', 'Review'] as const;

const INITIAL: WizardData = {
  restaurantName: '',
  cuisine: '',
  city: '',
  description: '',
  theme: 'hearth',
  wantsReservations: true,
  wantsOnlineOrdering: false,
  primaryCta: 'book',
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WizardData>(INITIAL);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(data.restaurantName.trim() && data.cuisine.trim() && data.city.trim());
    if (step === 1) return Boolean(data.description.trim() && data.theme);
    if (step === 2) return Boolean(data.primaryCta);
    return true;
  }, [step, data]);

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json() as { ok?: boolean; projectId?: string; error?: string };
      if (!res.ok || !json.ok || !json.projectId) throw new Error(json.error ?? 'Failed to create project');
      router.push(`/dashboard/projects/${json.projectId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Getting started</p>
            <h1 className={styles.title}>Launch your first restaurant site</h1>
            <p className={styles.sub}>Answer a few questions and Plated will create your starter project.</p>
          </div>
          <div className={styles.progress} aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((label, i) => (
              <div key={label} className={styles.progressItem}>
                <div className={[styles.dot, i <= step ? styles.dotActive : ''].join(' ')}>{i + 1}</div>
                <span className={styles.progressLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <section className={styles.section}>
            <label className={styles.field}>
              <span>Restaurant name</span>
              <input value={data.restaurantName} onChange={(e) => update('restaurantName', e.target.value)} placeholder="e.g. Juniper & Ash" />
            </label>
            <div className={styles.twoCol}>
              <label className={styles.field}>
                <span>Cuisine</span>
                <input value={data.cuisine} onChange={(e) => update('cuisine', e.target.value)} placeholder="Italian, sushi, steakhouse..." />
              </label>
              <label className={styles.field}>
                <span>City</span>
                <input value={data.city} onChange={(e) => update('city', e.target.value)} placeholder="Chicago" />
              </label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className={styles.section}>
            <label className={styles.field}>
              <span>Short description</span>
              <textarea value={data.description} onChange={(e) => update('description', e.target.value)} rows={5} placeholder="Describe the atmosphere, signature dishes, and what makes it special." />
            </label>
            <div className={styles.themeGrid}>
              {[
                { id: 'hearth', name: 'Hearth', desc: 'Warm, intimate, chef-driven.' },
                { id: 'spark',  name: 'Spark',  desc: 'Bold, modern, high-energy.' },
                { id: 'steel',  name: 'Steel',  desc: 'Clean, minimal, industrial.' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={[styles.themeCard, data.theme === theme.id ? styles.themeActive : ''].join(' ')}
                  onClick={() => update('theme', theme.id as ThemeId)}
                >
                  <strong>{theme.name}</strong>
                  <span>{theme.desc}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className={styles.section}>
            <div className={styles.toggleRow}>
              <label className={styles.toggleCard}>
                <input type="checkbox" checked={data.wantsReservations} onChange={(e) => update('wantsReservations', e.target.checked)} />
                <div>
                  <strong>Reservations</strong>
                  <span>Show a clear booking call-to-action.</span>
                </div>
              </label>
              <label className={styles.toggleCard}>
                <input type="checkbox" checked={data.wantsOnlineOrdering} onChange={(e) => update('wantsOnlineOrdering', e.target.checked)} />
                <div>
                  <strong>Online ordering</strong>
                  <span>Promote pickup or delivery links.</span>
                </div>
              </label>
            </div>

            <div className={styles.ctaGroup}>
              <span className={styles.groupLabel}>Primary homepage CTA</span>
              <div className={styles.pillRow}>
                {[
                  ['book', 'Book a table'],
                  ['order', 'Order online'],
                  ['call', 'Call now'],
                  ['visit', 'Visit us'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={[styles.pill, data.primaryCta === id ? styles.pillActive : ''].join(' ')}
                    onClick={() => update('primaryCta', id as WizardData['primaryCta'])}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className={styles.section}>
            <div className={styles.reviewCard}>
              <h2>{data.restaurantName || 'Your restaurant'}</h2>
              <p>{data.cuisine} · {data.city}</p>
              <p>{data.description}</p>
              <ul className={styles.reviewList}>
                <li>Theme: <strong>{data.theme}</strong></li>
                <li>Reservations: <strong>{data.wantsReservations ? 'Enabled' : 'Disabled'}</strong></li>
                <li>Online ordering: <strong>{data.wantsOnlineOrdering ? 'Enabled' : 'Disabled'}</strong></li>
                <li>Primary CTA: <strong>{data.primaryCta}</strong></li>
              </ul>
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </section>
        )}

        <div className={styles.footer}>
          <button type="button" className={styles.secondary} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className={styles.primary} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canContinue}>
              Continue
            </button>
          ) : (
            <button type="button" className={styles.primary} onClick={submit} disabled={submitting}>
              {submitting ? 'Creating project…' : 'Create my site'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
