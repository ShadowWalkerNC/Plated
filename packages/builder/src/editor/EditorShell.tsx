/**
 * EditorShell — full-window layout for the block DnD editor.
 *
 * Layout:
 *   Header bar (top):
 *     ← Back to wizard | Page tabs | [Preview] | Save button
 *   Body (flex row):
 *     SectionList (220px) | BlockCanvas (flex 1) | BlockInspector (300px)
 *
 * Initialises useEditorStore from the current wizard schema on mount.
 * onChange flushes section mutations back into useWizardStore so the
 * generator always sees the latest block order/visibility/config.
 *
 * Preview behaviour:
 *   - "Preview" button in the header opens a dedicated BrowserWindow
 *     served by a local http server on a random port.
 *   - While the preview window is open, every schema save triggers
 *     reloadPreview() so the window stays in sync.
 */
import { useEffect, useRef }      from 'react';
import { useWizardStore }         from '../store/useWizardStore.js';
import { useEditorStore }         from './useEditorStore.js';
import { BlockCanvas }            from './BlockCanvas.js';
import { SectionList }            from './SectionList.js';
import { BlockInspector }         from './BlockInspector.js';
import { usePreview }             from '../hooks/usePreview.js';
import type { EditorPage }        from './useEditorStore.js';
import type { TemplatePage }      from '@plated/types';
import styles from './EditorShell.module.css';

/** Convert TemplatePage[] (from schema or manifest) → EditorPage[] */
function toEditorPages(pages: TemplatePage[]): EditorPage[] {
  return pages.map((p) => ({
    id:       p.id,
    path:     p.path,
    title:    p.title,
    sections: p.sections,
  }));
}

export function EditorShell() {
  const schema        = useWizardStore((s) => s.schema);
  const updateSchema  = useWizardStore((s) => s.updateSchema);
  const setScreen     = useWizardStore((s) => s.setScreen);
  const filePath      = useWizardStore((s) => s.projectFilePath);
  const isDirty       = useWizardStore((s) => s.isDirty);
  const markClean     = useWizardStore((s) => s.markClean);

  const initFromPages  = useEditorStore((s) => s.initFromPages);
  const pages          = useEditorStore((s) => s.pages);
  const activePageId   = useEditorStore((s) => s.activePageId);
  const setActivePage  = useEditorStore((s) => s.setActivePage);

  const {
    loading:     previewLoading,
    isOpen:      previewIsOpen,
    error:       previewError,
    openPreview,
    reloadPreview,
    closePreview,
  } = usePreview();

  // Keep a stable ref to schema so the auto-reload effect always sees latest
  const schemaRef = useRef(schema);
  useEffect(() => { schemaRef.current = schema; }, [schema]);

  // Grab pages from the schema's template sections.
  const schemaPages: TemplatePage[] = (schema as unknown as { pages?: TemplatePage[] }).pages ?? [
    {
      id:       'home',
      path:     '/',
      title:    'Home',
      optional: false,
      sections: [],
      usesSlots: [],
    },
  ];

  // Init editor store on mount
  useEffect(() => {
    initFromPages(
      toEditorPages(schemaPages),
      (updatedPages) => {
        updateSchema({
          pages: updatedPages as unknown as TemplatePage[],
        } as Parameters<typeof updateSchema>[0]);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-reload preview whenever the schema changes and the window is open
  const prevSchemaRef = useRef<typeof schema | null>(null);
  useEffect(() => {
    if (!previewIsOpen) return;
    if (prevSchemaRef.current === schema) return;
    prevSchemaRef.current = schema;
    void reloadPreview(schema);
  }, [schema, previewIsOpen, reloadPreview]);

  async function handleSave() {
    if (!filePath) return;
    try {
      await window.plated.saveProject(schema, filePath);
      markClean();
    } catch (err) {
      console.error('[EditorShell] save failed', err);
    }
  }

  async function handlePreview() {
    if (previewIsOpen) {
      await closePreview();
    } else {
      await openPreview(schema);
    }
  }

  const previewLabel = previewLoading
    ? 'Building…'
    : previewIsOpen
      ? 'Close Preview'
      : 'Preview ▶';

  return (
    <div className={styles.shell}>
      {/* ─── Header ────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => setScreen('wizard')}
          type="button"
        >
          ← Wizard
        </button>

        <div className={styles.pageTabs}>
          {pages.map((page) => (
            <button
              key={page.id}
              className={`${styles.pageTab} ${page.id === activePageId ? styles.pageTabActive : ''}`}
              onClick={() => setActivePage(page.id)}
              type="button"
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className={styles.headerActions}>
          {previewError && (
            <span className={styles.previewError} title={previewError}>
              ⚠️ Preview error
            </span>
          )}
          <button
            className={`${styles.previewBtn} ${previewIsOpen ? styles.previewBtnActive : ''}`}
            onClick={() => void handlePreview()}
            disabled={previewLoading}
            type="button"
            title={previewIsOpen ? 'Close the preview window' : 'Open site preview in a new window'}
          >
            {previewLabel}
          </button>

          <button
            className={`${styles.saveBtn} ${isDirty ? styles.saveBtnDirty : ''}`}
            onClick={() => void handleSave()}
            disabled={!isDirty || !filePath}
            type="button"
          >
            {isDirty ? 'Save ●' : 'Saved'}
          </button>
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────────── */}
      <div className={styles.body}>
        <SectionList />
        <BlockCanvas />
        <BlockInspector />
      </div>
    </div>
  );
}
