/**
 * BlockToolbar — floating action bar above a selected block.
 *
 * Actions: move up, move down, toggle visible, duplicate, remove.
 * Positioned absolutely relative to the block card.
 */
import { useEditorStore } from './useEditorStore.js';
import styles from './BlockToolbar.module.css';

interface BlockToolbarProps {
  blockId:   string;
  sectionId: string;
}

export function BlockToolbar({ blockId, sectionId }: BlockToolbarProps) {
  const moveUp          = useEditorStore((s) => s.moveBlockUp);
  const moveDown        = useEditorStore((s) => s.moveBlockDown);
  const toggleVisible   = useEditorStore((s) => s.toggleBlockVisible);
  const duplicate       = useEditorStore((s) => s.duplicateBlock);
  const remove          = useEditorStore((s) => s.removeBlock);
  const pages           = useEditorStore((s) => s.pages);
  const activePageId    = useEditorStore((s) => s.activePageId);

  const activePage = pages.find((p) => p.id === activePageId);
  const section    = activePage?.sections.find((s) => s.id === sectionId);
  const block      = section?.blocks.find((b) => b.id === blockId);

  function stop(e: React.MouseEvent) { e.stopPropagation(); }

  return (
    <div className={styles.toolbar} onClick={stop}>
      <ToolbarBtn title="Move up"   onClick={() => moveUp(blockId)}>↑</ToolbarBtn>
      <ToolbarBtn title="Move down" onClick={() => moveDown(blockId)}>↓</ToolbarBtn>
      <ToolbarBtn
        title={block?.visible ? 'Hide' : 'Show'}
        onClick={() => toggleVisible(blockId)}
      >
        {block?.visible ? '👁️' : '🚫'}
      </ToolbarBtn>
      <ToolbarBtn title="Duplicate" onClick={() => duplicate(blockId)}>📋</ToolbarBtn>
      <ToolbarBtn title="Remove" onClick={() => remove(blockId)} danger>
        🗑️
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  title, onClick, children, danger = false,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      className={`${styles.btn} ${danger ? styles.btnDanger : ''}`}
      title={title}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
