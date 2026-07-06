/**
 * BlockInspector — right panel showing config fields for the selected block.
 *
 * Generic config editor: iterates block.config entries and renders
 * the appropriate input based on value type:
 *   boolean  → toggle switch
 *   number   → number input
 *   string   → text input (or textarea if key ends in 'text'|'html'|'body')
 *
 * Block type label + icon shown at the top.
 * Falls back to "Select a block" empty state.
 */
import { useEditorStore }                 from './useEditorStore.js';
import { BLOCK_LABELS, BLOCK_ICONS }      from './BlockCanvas.js';
import styles from './BlockInspector.module.css';

export function BlockInspector() {
  const pages           = useEditorStore((s) => s.pages);
  const activePageId    = useEditorStore((s) => s.activePageId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const updateConfig    = useEditorStore((s) => s.updateBlockConfig);

  // Find the selected block across all sections
  const activePage = pages.find((p) => p.id === activePageId);
  let selectedBlock = null;
  if (activePage && selectedBlockId) {
    for (const section of activePage.sections) {
      const found = section.blocks.find((b) => b.id === selectedBlockId);
      if (found) { selectedBlock = found; break; }
    }
  }

  if (!selectedBlock) {
    return (
      <aside className={styles.panel}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🖋️</span>
          <span>Select a block to edit its settings</span>
        </div>
      </aside>
    );
  }

  const block = selectedBlock;
  const configEntries = Object.entries(block.config);

  function handleChange(key: string, value: unknown) {
    updateConfig(block.id, { [key]: value });
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.typeHeader}>
        <span className={styles.typeIcon}>{BLOCK_ICONS[block.type] ?? '📦'}</span>
        <span className={styles.typeLabel}>{BLOCK_LABELS[block.type] ?? block.type}</span>
      </div>

      {configEntries.length === 0 && (
        <p className={styles.noConfig}>This block has no configurable settings.</p>
      )}

      <div className={styles.fields}>
        {configEntries.map(([key, value]) => (
          <ConfigField
            key={key}
            fieldKey={key}
            value={value}
            onChange={(v) => handleChange(key, v)}
          />
        ))}
      </div>
    </aside>
  );
}

// ─── Generic config field ──────────────────────────────────────────────────

function humanLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function ConfigField({
  fieldKey, value, onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = humanLabel(fieldKey);
  const isLong = /text|html|body|description|content/i.test(fieldKey);

  if (typeof value === 'boolean') {
    return (
      <label className={styles.toggleRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <button
          className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
          onClick={() => onChange(!value)}
          type="button"
          role="switch"
          aria-checked={value}
        >
          <span className={styles.toggleThumb} />
        </button>
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <label className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          className={styles.input}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    );
  }

  if (typeof value === 'string') {
    if (isLong) {
      return (
        <label className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{label}</span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        </label>
      );
    }
    return (
      <label className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  // Fallback: JSON string for complex values
  return (
    <label className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        className={styles.input}
        type="text"
        value={JSON.stringify(value)}
        onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch { /* no-op */ } }}
      />
    </label>
  );
}
