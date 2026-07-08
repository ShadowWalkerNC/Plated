/**
 * BlockEditor.tsx — Main canvas showing draggable blocks per section.
 *
 * Only the currently active section (from useEditorStore.activeSectionId)
 * shows its blocks expanded. All sections are shown as collapsed rows
 * when no section is active.
 *
 * Block rows:
 *   [drag handle] [eye toggle] [type badge] [label] → click to select (opens BlockToolbar)
 */
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS }              from '@dnd-kit/utilities';
import { useState }         from 'react';
import { useEditorStore }   from './useEditorStore.js';
import type { BlockSchema, TemplateSection } from '@plated/types';
import styles               from './EditorShell.module.css';

// ── Sortable block row ────────────────────────────────────────────────────────
function SortableBlockRow({
  block,
  sectionId,
}: {
  block: BlockSchema;
  sectionId: string;
}) {
  const activeBlockId  = useEditorStore((s) => s.activeBlockId);
  const setActiveBlock = useEditorStore((s) => s.setActiveBlock);
  const toggleBlock    = useEditorStore((s) => s.toggleBlock);

  const isSelected = activeBlockId === block.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.blockRow} ${isSelected ? styles.blockRowSelected : ''} ${!block.visible ? styles.blockRowHidden : ''}`}
      onClick={() => setActiveBlock(isSelected ? null : block.id)}
    >
      {/* Drag handle */}
      <span
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder block"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </span>

      {/* Visibility */}
      <button
        className={styles.eyeBtn}
        onClick={(e) => { e.stopPropagation(); toggleBlock(sectionId, block.id); }}
        aria-label={block.visible ? 'Hide block' : 'Show block'}
        title={block.visible ? 'Hide block' : 'Show block'}
      >
        {block.visible ? '👁' : '🚫'}
      </button>

      {/* Type badge */}
      <span className={styles.blockTypeBadge}>{block.type}</span>

      {/* Selected indicator */}
      {isSelected && <span className={styles.selectedMarker}>✎</span>}
    </div>
  );
}

// ── Ghost block used in DragOverlay ──────────────────────────────────────────
function GhostBlockRow({ block }: { block: BlockSchema }) {
  return (
    <div className={`${styles.blockRow} ${styles.blockRowDragOverlay}`}>
      <span className={styles.dragHandle}>⠿</span>
      <span className={styles.blockTypeBadge}>{block.type}</span>
    </div>
  );
}

// ── Section with its blocks ───────────────────────────────────────────────────
function SectionBlockList({ section }: { section: TemplateSection }) {
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart({ active }: DragStartEvent) {
    setDraggingId(String(active.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (!over || active.id === over.id) return;
    const fromIdx = section.blocks.findIndex((b) => b.id === active.id);
    const toIdx   = section.blocks.findIndex((b) => b.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderBlocks(section.id, fromIdx, toIdx);
  }

  const draggingBlock = draggingId
    ? section.blocks.find((b) => b.id === draggingId) ?? null
    : null;

  if (section.blocks.length === 0) {
    return (
      <div className={styles.emptySection}>
        No blocks in this section.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={section.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.blocks
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <SortableBlockRow key={block.id} block={block} sectionId={section.id} />
          ))}
      </SortableContext>

      <DragOverlay>
        {draggingBlock ? <GhostBlockRow block={draggingBlock} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ── BlockEditor ───────────────────────────────────────────────────────────────
export function BlockEditor() {
  const sections        = useEditorStore((s) => s.sections);
  const activeSectionId = useEditorStore((s) => s.activeSectionId);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);

  if (sections.length === 0) {
    return (
      <div className={styles.emptyCanvas}>
        <p>No sections found.</p>
        <p className={styles.emptyCanvasHint}>
          Select a template in the wizard to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.blockCanvas}>
      {sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const isExpanded = activeSectionId === section.id;
          return (
            <div key={section.id} className={styles.sectionBlock}>
              {/* Section header strip */}
              <div
                className={`${styles.sectionHeader} ${isExpanded ? styles.sectionHeaderOpen : ''}`}
                onClick={() => setActiveSection(isExpanded ? null : section.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveSection(isExpanded ? null : section.id)}
              >
                <span className={`${styles.sectionVisualDot} ${section.visible ? styles.dotVisible : styles.dotHidden}`} />
                <span className={styles.sectionHeaderName}>{section.name}</span>
                <span className={`${styles.sectionChevron} ${isExpanded ? styles.chevronOpen : ''}`}>›</span>
              </div>

              {/* Block list — shown only when expanded */}
              {isExpanded && (
                <div className={styles.blockList}>
                  <SectionBlockList section={section} />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
