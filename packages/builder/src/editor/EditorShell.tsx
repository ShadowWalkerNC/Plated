/**
 * EditorShell.tsx — Root layout for the block DnD editor.
 *
 * Layout: 3-column CSS Grid
 *   [SectionPanel 240px] | [BlockEditor flex-1] | [BlockToolbar 280px]
 *
 * Header bar: project name | Save | Preview | Export
 */
import { useEffect, useCallback }   from 'react';
import { useWizardStore }           from '../store/useWizardStore.js';
import { useEditorStore }           from './useEditorStore.js';
import { SectionPanel }             from './SectionPanel.js';
import { BlockEditor }              from './BlockEditor.js';
import { BlockToolbar }             from './BlockToolbar.js';
import styles                       from './EditorShell.module.css';

export function EditorShell() {
  const schema          = useWizardStore((s) => s.schema);
  const projectFilePath = useWizardStore((s) => s.projectFilePath);
  const wizardIsDirty   = useWizardStore((s) => s.isDirty);
  const setScreen       = useWizardStore((s) => s.setScreen);
  const markClean       = useWizardStore((s) => s.markClean);
  const initFromSchema  = useEditorStore((s) => s.initFromSchema);
  const editorIsDirty   = useEditorStore((s) => s.isDirty);

  const businessName = (schema as any)?.business?.name || 'Untitled project';
  const isDirty = wizardIsDirty || editorIsDirty;

  // Bootstrap editor from the current schema on mount
  useEffect(() => { initFromSchema(); }, [initFromSchema]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    let filePath = projectFilePath;
    if (!filePath) {
      // First save — open save dialog via dialog:saveFile IPC
      const result = await (window as any).plated.saveFile({
        title:       'Save project',
        defaultPath: `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.plated.json`,
        filters:     [{ name: 'Plated Project', extensions: ['plated.json', 'json'] }],
      });
      if (!result) return;
      filePath = result;
    }
    await (window as any).plated.saveProject(schema, filePath);
    useWizardStore.getState().setProjectFilePath(filePath);
    markClean();
  }, [schema, projectFilePath, businessName, markClean]);

  // ── Preview ───────────────────────────────────────────────────────────────
  const handlePreview = useCallback(async () => {
    await (window as any).plated.previewOpen(schema);
  }, [schema]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    setScreen('export');
  }, [setScreen]);

  return (
    <div className={styles.shell}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => setScreen('wizard')}
          aria-label="Back to wizard"
        >
          ←
        </button>

        <span className={styles.projectName}>
          {businessName}
          {isDirty && <span className={styles.dirtyDot} aria-label="Unsaved changes" />}
        </span>

        <div className={styles.headerActions}>
          <button className={styles.btnGhost} onClick={handlePreview}>
            Preview
          </button>
          <button
            className={`${styles.btnGhost} ${isDirty ? styles.btnDirty : ''}`}
            onClick={handleSave}
          >
            {isDirty ? 'Save*' : 'Saved'}
          </button>
          <button className={styles.btnPrimary} onClick={handleExport}>
            Export site
          </button>
        </div>
      </header>

      {/* ── 3-column body ─────────────────────────────────────────────── */}
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <SectionPanel />
        </aside>

        <main className={styles.canvas}>
          <BlockEditor />
        </main>

        <aside className={styles.toolbar}>
          <BlockToolbar />
        </aside>
      </div>
    </div>
  );
}
