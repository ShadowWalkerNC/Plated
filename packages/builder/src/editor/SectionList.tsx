/**
 * SectionList — left sidebar panel.
 *
 * Lists all sections for the active page.
 * Each row: visibility toggle + section name + scroll-to button.
 * Sections can be reordered by drag (simple up/down arrows for now;
 * full DnD reorder is in useEditorStore.reorderSection).
 */
import { useEditorStore } from './useEditorStore.js';
import styles from './SectionList.module.css';

export function SectionList() {
  const pages              = useEditorStore((s) => s.pages);
  const activePageId       = useEditorStore((s) => s.activePageId);
  const reorderSection     = useEditorStore((s) => s.reorderSection);
  const toggleSectionVisible = useEditorStore((s) => s.toggleSectionVisible);

  const activePage = pages.find((p) => p.id === activePageId);
  const sections   = activePage
    ? [...activePage.sections].sort((a, b) => a.order - b.order)
    : [];

  function scrollToSection(id: string) {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside className={styles.sidebar}>
      <p className={styles.heading}>Sections</p>

      {sections.length === 0 && (
        <p className={styles.empty}>No sections</p>
      )}

      <ol className={styles.list}>
        {sections.map((section, idx) => (
          <li key={section.id} className={styles.row}>
            {/* Visibility toggle */}
            <button
              className={styles.visBtn}
              title={section.visible ? 'Hide section' : 'Show section'}
              onClick={() => toggleSectionVisible(section.id)}
              type="button"
            >
              {section.visible ? '👁️' : '🚫'}
            </button>

            {/* Name — click to scroll */}
            <button
              className={`${styles.nameBtn} ${!section.visible ? styles.hiddenText : ''}`}
              onClick={() => scrollToSection(section.id)}
              type="button"
            >
              {section.name}
            </button>

            {/* Up / Down */}
            <div className={styles.orderBtns}>
              <button
                className={styles.orderBtn}
                onClick={() => reorderSection(idx, idx - 1)}
                disabled={idx === 0}
                title="Move up"
                type="button"
              >
                ↑
              </button>
              <button
                className={styles.orderBtn}
                onClick={() => reorderSection(idx, idx + 1)}
                disabled={idx === sections.length - 1}
                title="Move down"
                type="button"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
