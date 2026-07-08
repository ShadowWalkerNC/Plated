/**
 * BlockToolbar.tsx — Right panel config editor for the selected block.
 *
 * Shows the block's type-specific fields based on block.config.
 * Generic field types derived from the config key name / value type:
 *   - boolean   → toggle
 *   - number    → number input
 *   - string starting with '#' → colour picker
 *   - string (url hint)        → URL input
 *   - string (long/contains spaces) → textarea
 *   - string                   → text input
 *
 * All edits call useEditorStore.updateBlockConfig() which immediately
 * flushes back to WizardStore.
 */
import { useCallback }      from 'react';
import { useEditorStore }   from './useEditorStore.js';
import type { BlockSchema } from '@plated/types';
import styles               from './EditorShell.module.css';

// ── Field renderers ─────────────────────────────────────────────────────────
function FieldLabel({ label }: { label: string }) {
  return <label className={styles.fieldLabel}>{label}</label>;
}

function BoolField({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={styles.fieldRow}>
      <FieldLabel label={label} />
      <button
        className={`${styles.toggleBtn} ${value ? styles.toggleOn : styles.toggleOff}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        {value ? 'On' : 'Off'}
      </button>
    </div>
  );
}

function NumberField({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.fieldRow}>
      <FieldLabel label={label} />
      <input
        className={styles.fieldInput}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.fieldRow}>
      <FieldLabel label={label} />
      <div className={styles.colorRow}>
        <input
          type="color"
          value={value}
          className={styles.colorSwatch}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={styles.fieldInput}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function TextareaField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.fieldRow}>
      <FieldLabel label={label} />
      <textarea
        className={styles.fieldTextarea}
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextField({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className={styles.fieldRow}>
      <FieldLabel label={label} />
      <input
        className={styles.fieldInput}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Infer field type from key + value ────────────────────────────────────────
function renderField(
  key: string,
  value: unknown,
  onChange: (v: unknown) => void,
): React.ReactNode {
  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  if (typeof value === 'boolean') {
    return <BoolField key={key} label={label} value={value} onChange={(v) => onChange(v)} />;
  }
  if (typeof value === 'number') {
    return <NumberField key={key} label={label} value={value} onChange={(v) => onChange(v)} />;
  }
  if (typeof value === 'string') {
    if (value.startsWith('#') || key.toLowerCase().includes('color') || key.toLowerCase().includes('colour')) {
      return <ColorField key={key} label={label} value={value} onChange={(v) => onChange(v)} />;
    }
    if (key.toLowerCase().includes('url') || key.toLowerCase().includes('src') || key.toLowerCase().includes('href')) {
      return <TextField key={key} label={label} value={value} onChange={(v) => onChange(v as string)} type="url" />;
    }
    if (value.length > 80 || key.toLowerCase().includes('text') || key.toLowerCase().includes('description')) {
      return <TextareaField key={key} label={label} value={value} onChange={(v) => onChange(v)} />;
    }
    return <TextField key={key} label={label} value={value} onChange={(v) => onChange(v as string)} />;
  }
  // Fallback for arrays / objects — show JSON
  return (
    <div className={styles.fieldRow} key={key}>
      <FieldLabel label={label} />
      <pre className={styles.fieldPre}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

// ── BlockToolbar ──────────────────────────────────────────────────────────────
export function BlockToolbar() {
  const activeBlockId    = useEditorStore((s) => s.activeBlockId);
  const sections         = useEditorStore((s) => s.sections);
  const updateBlockConfig = useEditorStore((s) => s.updateBlockConfig);

  // Find the active block across all sections
  const activeBlock: BlockSchema | undefined = sections
    .flatMap((s) => s.blocks)
    .find((b) => b.id === activeBlockId);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!activeBlockId) return;
      updateBlockConfig(activeBlockId, { [key]: value });
    },
    [activeBlockId, updateBlockConfig],
  );

  if (!activeBlock) {
    return (
      <div className={styles.toolbarEmpty}>
        <p className={styles.toolbarEmptyHint}>Select a block to edit its settings.</p>
      </div>
    );
  }

  const configEntries = Object.entries(activeBlock.config);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarHeader}>
        <span className={styles.toolbarBlockType}>{activeBlock.type}</span>
        <span className={styles.toolbarBlockId}>#{activeBlock.id.slice(0, 6)}</span>
      </div>

      <div className={styles.toolbarFields}>
        {/* Visibility as a first-class toggle */}
        <BoolField
          label="Visible"
          value={activeBlock.visible}
          onChange={(v) => {
            const sectionId = sections.find((s) =>
              s.blocks.some((b) => b.id === activeBlock.id),
            )?.id;
            if (sectionId) {
              useEditorStore.getState().toggleBlock(sectionId, activeBlock.id);
            }
            // Keep TS happy — v is unused here since toggleBlock handles it
            void v;
          }}
        />

        {configEntries.length === 0 && (
          <p className={styles.noConfig}>No configurable fields for this block.</p>
        )}

        {configEntries.map(([key, val]) =>
          renderField(key, val, (newVal) => handleChange(key, newVal)),
        )}
      </div>
    </div>
  );
}
