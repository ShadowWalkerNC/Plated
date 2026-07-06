/**
 * EditorShell — full-window layout for the block DnD editor.
 *
 * Layout:
 *   Header bar (top):
 *     ← Back to wizard | Page tabs | Save button
 *   Body (flex row):
 *     SectionList (220px) | BlockCanvas (flex 1) | BlockInspector (300px)
 *
 * Initialises useEditorStore from the current wizard schema on mount.
 * onChange flushes section mutations back into useWizardStore so the
 * generator always sees the latest block order/visibility/config.
 */
import { useEffect }           from 'react';
import { useWizardStore }      from '../store/useWizardStore.js';
import { useEditorStore }      from './useEditorStore.js';
import { BlockCanvas }         from './BlockCanvas.js';
import { SectionList }         from './SectionList.js';
import { BlockInspector }      from './BlockInspector.js';
import type { EditorPage }     from './useEditorStore.js';
import type { TemplatePage }   from '@plated/types';
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

  // Grab pages from the schema’s template sections.
  // In Phase 1 the generator doesn’t yet write pages back into ProjectSchema,
  // so we fall back to a single synthetic page from the branding/menu data.
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
        // Flush block/section mutations back to wizard schema
        updateSchema({
          pages: updatedPages as unknown as TemplatePage[],
        } as Parameters<typeof updateSchema>[0]);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!filePath) return;
    try {
      await window.plated.saveProject(schema, filePath);
      markClean();
    } catch (err) {
      console.error('[EditorShell] save failed', err);
    }
  }

  return (
    <div className={styles.shell}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
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

        <button
          className={`${styles.saveBtn} ${isDirty ? styles.saveBtnDirty : ''}`}
          onClick={() => void handleSave()}
          disabled={!isDirty || !filePath}
          type="button"
        >
          {isDirty ? 'Save ●' : 'Saved'}
        </button>
      </header>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <div className={styles.body}>
        <SectionList />
        <BlockCanvas />
        <BlockInspector />
      </div>
    </div>
  );
}
