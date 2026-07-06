/**
 * Step 6 — Media & Brand
 *
 * Logo, hero image, and favicon are picked via MediaLibrary
 * (Local files tab + Unsplash tab).
 *
 * Hero image supports crop (CropModal, 16:9) and background removal
 * is offered for logos (BgRemovalPanel).
 *
 * Brand colors remain the same ColorPicker row.
 */
import { useState } from 'react';
import { useWizardStore }  from '../../store/useWizardStore.js';
import { MediaLibrary }    from '../../media/MediaLibrary.js';
import { CropModal }       from '../../media/CropModal.js';
import { BgRemovalPanel }  from '../../media/BgRemovalPanel.js';
import { ColorPicker }     from '../components/ColorPicker.js';
import styles from './Step.module.css';
import mediaStyles from './Step6Media.module.css';

type ActivePicker = 'logo' | 'hero' | 'favicon' | null;
type ActiveTool   = 'crop-hero' | 'bg-remove-logo' | null;

export function Step6Media() {
  const branding     = useWizardStore((s) => s.schema.branding);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [activeTool,   setActiveTool]   = useState<ActiveTool>(null);

  function applyBranding(patch: Partial<typeof branding>) {
    updateSchema({ branding: { ...branding, ...patch } });
  }

  function handleMediaSelect(field: ActivePicker, url: string) {
    if (!field) return;
    applyBranding({ [`${field}Url`]: url } as Partial<typeof branding>);
    setActivePicker(null);
  }

  const fieldToKey: Record<NonNullable<ActivePicker>, keyof typeof branding> = {
    logo:    'logoUrl',
    hero:    'heroImageUrl',
    favicon: 'faviconSourceUrl',
  };

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Media & Brand</h1>
        <p className={styles.subtitle}>Upload a logo, hero image, and favicon. Set your brand palette.</p>
      </header>

      {/* ─── Image slots ───────────────────────────────────────────── */}
      <div className={styles.grid2}>
        <ImageSlot
          label="Logo"
          hint="PNG or SVG with transparency recommended"
          value={branding.logoUrl}
          onPick={() => setActivePicker('logo')}
          extraActions={
            branding.logoUrl
              ? [{ label: 'Remove background', onClick: () => setActiveTool('bg-remove-logo') }]
              : []
          }
        />
        <ImageSlot
          label="Hero image"
          hint="16:9 landscape, min 1200 × 675 px"
          value={branding.heroImageUrl}
          onPick={() => setActivePicker('hero')}
          extraActions={
            branding.heroImageUrl
              ? [{ label: 'Crop (16:9)', onClick: () => setActiveTool('crop-hero') }]
              : []
          }
        />
      </div>

      <ImageSlot
        label="Favicon"
        hint="PNG 512 × 512 px (we’ll generate all favicon sizes)"
        value={branding.faviconSourceUrl}
        onPick={() => setActivePicker('favicon')}
      />

      {/* ─── Brand colors ───────────────────────────────────────────── */}
      <div className={styles.grid3}>
        <ColorPicker label="Primary"
          value={branding.primaryColor}
          onChange={(v) => applyBranding({ primaryColor: v })} />
        <ColorPicker label="Secondary"
          value={branding.secondaryColor}
          onChange={(v) => applyBranding({ secondaryColor: v })} />
        <ColorPicker label="Accent"
          value={branding.accentColor}
          onChange={(v) => applyBranding({ accentColor: v })} />
      </div>

      {/* ─── Media Library panel ────────────────────────────────────── */}
      {activePicker && (
        <MediaLibrary
          field={activePicker}
          onSelect={(url) => handleMediaSelect(activePicker, url)}
          onClose={() => setActivePicker(null)}
        />
      )}

      {/* ─── Crop modal (portal, overlays everything) ────────────────── */}
      {activeTool === 'crop-hero' && branding.heroImageUrl && (
        <CropModal
          src={branding.heroImageUrl.startsWith('/') ? `file://${branding.heroImageUrl}` : branding.heroImageUrl}
          aspect={16 / 9}
          onConfirm={(url) => { applyBranding({ heroImageUrl: url }); setActiveTool(null); }}
          onClose={() => setActiveTool(null)}
        />
      )}

      {/* ─── Background removal panel ───────────────────────────── */}
      {activeTool === 'bg-remove-logo' && branding.logoUrl && (
        <BgRemovalPanel
          src={branding.logoUrl}
          onConfirm={(url) => { applyBranding({ logoUrl: url }); setActiveTool(null); }}
          onClose={() => setActiveTool(null)}
        />
      )}
    </section>
  );
}

// ─── ImageSlot ────────────────────────────────────────────────────────────

interface ImageSlotProps {
  label: string;
  hint?: string;
  value?: string;
  onPick: () => void;
  extraActions?: Array<{ label: string; onClick: () => void }>;
}

function ImageSlot({ label, hint, value, onPick, extraActions = [] }: ImageSlotProps) {
  const src = value
    ? (value.startsWith('/') ? `file://${value}` : value)
    : null;

  return (
    <div className={mediaStyles.slot}>
      <div className={mediaStyles.slotHeader}>
        <div>
          <span className={mediaStyles.slotLabel}>{label}</span>
          {hint && <span className={mediaStyles.slotHint}>{hint}</span>}
        </div>
        <div className={mediaStyles.slotActions}>
          {extraActions.map((a) => (
            <button key={a.label} className={mediaStyles.toolBtn} onClick={a.onClick} type="button">
              {a.label}
            </button>
          ))}
          <button className={mediaStyles.pickBtn} onClick={onPick} type="button">
            {value ? 'Change' : 'Choose'}
          </button>
        </div>
      </div>

      <div className={mediaStyles.preview}>
        {src
          ? <img className={mediaStyles.previewImg} src={src} alt={label} />
          : <span className={mediaStyles.previewEmpty}>No image selected</span>
        }
      </div>
    </div>
  );
}
