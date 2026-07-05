'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/db/schema';
import type { ProjectSchema } from '@nexcms/types';
import styles from './ProjectEditor.module.css';

// ── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Business',   hint: 'Name, tagline, contact' },
  { id: 2, title: 'Website',    hint: 'Existing site URL' },
  { id: 3, title: 'Social',     hint: 'Profiles and delivery links' },
  { id: 4, title: 'Location',   hint: 'Address and hours' },
  { id: 5, title: 'Menu',       hint: 'Categories and items' },
  { id: 6, title: 'Media',      hint: 'Logo, hero, brand colors' },
  { id: 7, title: 'Template',   hint: 'Business type and style' },
  { id: 8, title: 'Extensions', hint: 'Analytics and add-ons' },
] as const;

interface Props { project: Project }

export function ProjectEditor({ project }: Props) {
  const router = useRouter();
  const [schema, setSchema] = useState<ProjectSchema>(project.schema);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const progress = Math.round((step / STEPS.length) * 100);

  const updateSchema = useCallback((patch: Partial<ProjectSchema>) => {
    setSchema((prev) => deepMerge(prev, patch) as ProjectSchema);
    setSaved(false);
  }, []);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, name: schema.business.name || project.name }),
      });
      if (!res.ok) throw new Error('Save failed.');
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <button className={styles.backLink} onClick={() => router.push(`/dashboard/projects/${project.id}`)}>← Back</button>
          <div className={styles.projectName}>{schema.business.name || 'Untitled project'}</div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressRow}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <ol className={styles.stepList}>
          {STEPS.map((s) => (
            <li key={s.id}>
              <button
                className={[
                  styles.stepBtn,
                  s.id === step    ? styles.stepActive    : '',
                  s.id < step      ? styles.stepComplete  : '',
                ].join(' ')}
                onClick={() => setStep(s.id)}
              >
                <span className={styles.stepNum}>{s.id < step ? '✓' : s.id}</span>
                <span className={styles.stepInfo}>
                  <span className={styles.stepTitle}>{s.title}</span>
                  <span className={styles.stepHint}>{s.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.sidebarSave}>
          {saveError && <div className={styles.saveError}>{saveError}</div>}
          {saved    && <div className={styles.saveOk}>Saved ✓</div>}
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.card}>
          <StepView step={step} schema={schema} updateSchema={updateSchema} />
        </div>
        <div className={styles.footerNav}>
          <button className={styles.backBtn} onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button>
          <button className={styles.nextBtn} onClick={() => step < STEPS.length ? setStep((s) => s + 1) : save()}>
            {step === STEPS.length ? 'Save & finish' : 'Continue'}
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Step router ──────────────────────────────────────────────────────────────
function StepView({
  step, schema, updateSchema,
}: {
  step: number;
  schema: ProjectSchema;
  updateSchema: (patch: Partial<ProjectSchema>) => void;
}) {
  const b = schema.business;
  const br = schema.branding;
  const s = schema.social;

  switch (step) {
    case 1: return (
      <FormSection title="Business Basics" subtitle="Core identity shown across the entire site.">
        <Grid2>
          <Field label="Business name"><input value={b.name} onChange={(e) => updateSchema({ business: { ...b, name: e.target.value }, seo: { ...schema.seo, siteTitle: e.target.value } })} placeholder="Hearth & Vine" /></Field>
          <Field label="Cuisine type"><input value={b.cuisineType} onChange={(e) => updateSchema({ business: { ...b, cuisineType: e.target.value } })} placeholder="Italian · Seafood" /></Field>
        </Grid2>
        <Field label="Tagline"><input value={b.tagline} onChange={(e) => updateSchema({ business: { ...b, tagline: e.target.value } })} placeholder="Wood-fired food. Warm hospitality." /></Field>
        <Field label="Description"><textarea value={b.description} onChange={(e) => updateSchema({ business: { ...b, description: e.target.value } })} placeholder="2–4 sentences…" /></Field>
        <Grid3>
          <Field label="Phone"><input value={b.phone} onChange={(e) => updateSchema({ business: { ...b, phone: e.target.value } })} placeholder="(555) 123-4567" /></Field>
          <Field label="Email"><input value={b.email} onChange={(e) => updateSchema({ business: { ...b, email: e.target.value } })} placeholder="hello@restaurant.com" /></Field>
          <Field label="Founded year"><input value={b.foundedYear} onChange={(e) => updateSchema({ business: { ...b, foundedYear: e.target.value } })} placeholder="2017" /></Field>
        </Grid3>
      </FormSection>
    );

    case 2: return (
      <FormSection title="Existing Website" subtitle="Optional migration reference URL.">
        <Field label="Current website URL" hint="Leave blank if this is a new launch.">
          <input value={b.existingWebsiteUrl} onChange={(e) => updateSchema({ business: { ...b, existingWebsiteUrl: e.target.value } })} placeholder="https://www.example.com" />
        </Field>
      </FormSection>
    );

    case 3: return (
      <FormSection title="Social & Listings" subtitle="Link profiles, review pages, and delivery partners.">
        <Grid2>
          {([
            ['instagram',     'Instagram',     'https://instagram.com/handle'],
            ['facebook',      'Facebook',      'https://facebook.com/page'],
            ['twitter',       'Twitter / X',   'https://x.com/handle'],
            ['googleBusiness','Google Business','https://g.page/...'],
            ['yelp',          'Yelp',          'https://yelp.com/biz/...'],
            ['tripadvisor',   'Tripadvisor',   'https://tripadvisor.com/...'],
            ['doordash',      'DoorDash',      'https://doordash.com/store/...'],
            ['ubereats',      'Uber Eats',     'https://ubereats.com/store/...'],
            ['grubhub',       'Grubhub',       'https://grubhub.com/...'],
            ['toast',         'Toast',         'https://order.toasttab.com/...'],
            ['chownow',       'ChowNow',       'https://direct.chownow.com/...'],
          ] as const).map(([key, label, ph]) => (
            <Field key={key} label={label}>
              <input value={s[key]} onChange={(e) => updateSchema({ social: { ...s, [key]: e.target.value } })} placeholder={ph} />
            </Field>
          ))}
        </Grid2>
      </FormSection>
    );

    case 4: return (
      <FormSection title="Location & Hours" subtitle="Primary location address and weekly schedule.">
        <p style={{ color: 'var(--color-text-muted)' }}>Location editing available in the desktop app for this release. Hours and address sync from your saved project file.</p>
      </FormSection>
    );

    case 5: return (
      <FormSection title="Menu" subtitle="Categories and items.">
        <p style={{ color: 'var(--color-text-muted)' }}>{schema.menu.categories.length} categories · {schema.menu.categories.reduce((n, c) => n + c.items.length, 0)} items saved. Full menu editing is available in the desktop builder.</p>
      </FormSection>
    );

    case 6: return (
      <FormSection title="Media & Brand" subtitle="Brand colors and asset URLs.">
        <Grid2>
          <Field label="Logo URL"><input value={br.logoUrl} onChange={(e) => updateSchema({ branding: { ...br, logoUrl: e.target.value } })} placeholder="https://cdn.example.com/logo.png" /></Field>
          <Field label="Hero image URL"><input value={br.heroImageUrl} onChange={(e) => updateSchema({ branding: { ...br, heroImageUrl: e.target.value } })} placeholder="https://cdn.example.com/hero.jpg" /></Field>
        </Grid2>
        <Grid3>
          <Field label="Primary color"><input type="color" value={br.primaryColor || '#8a4b2f'} onChange={(e) => updateSchema({ branding: { ...br, primaryColor: e.target.value } })} /></Field>
          <Field label="Secondary color"><input type="color" value={br.secondaryColor || '#f4ede4'} onChange={(e) => updateSchema({ branding: { ...br, secondaryColor: e.target.value } })} /></Field>
          <Field label="Accent color"><input type="color" value={br.accentColor || '#c98f4a'} onChange={(e) => updateSchema({ branding: { ...br, accentColor: e.target.value } })} /></Field>
        </Grid3>
      </FormSection>
    );

    case 7: return (
      <FormSection title="Template & Style" subtitle="Business type and design direction.">
        <Field label="Business type">
          <select value={schema.businessType} onChange={(e) => updateSchema({ businessType: e.target.value })}>
            {['restaurant','bakery','cafe','bar','food-truck'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </FormSection>
    );

    case 8: return (
      <FormSection title="Extensions" subtitle="Optional add-ons.">
        {(['googleAnalytics','reservations','emailCapture','liveChat'] as const).map((key) => {
          const ext = (schema.extensions ?? {}) as Record<string, { enabled?: boolean }>;
          const checked = Boolean(ext[key]?.enabled);
          return (
            <label key={key} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.85rem', borderRadius: '0.9rem', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <input type="checkbox" checked={checked} onChange={(e) => updateSchema({ extensions: { ...ext, [key]: { enabled: e.target.checked } } })} />
              <span style={{ fontWeight: 600 }}>{key}</span>
            </label>
          );
        })}
      </FormSection>
    );

    default: return null;
  }
}

// ── Primitive helpers ────────────────────────────────────────────────────────
function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'var(--color-text)', lineHeight: 1, margin: 0 }}>{title}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{label}</span>
      {hint && <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>{hint}</span>}
      <div className={styles.control}>{children}</div>
    </label>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>{children}</div>;
}

function Grid3({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>{children}</div>;
}

// ── Deep merge ───────────────────────────────────────────────────────────────
function deepMerge(target: unknown, source: unknown): unknown {
  if (!isObject(target) || !isObject(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = (source as Record<string, unknown>)[key];
    const tv = (target as Record<string, unknown>)[key];
    result[key] = isObject(sv) && isObject(tv) ? deepMerge(tv, sv) : sv;
  }
  return result;
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
