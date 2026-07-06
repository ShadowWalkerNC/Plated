/**
 * BlockCanvas — the main drag-and-drop editing surface.
 *
 * Layout: vertical stack of sections. Each section is a
 * droppable column whose blocks are horizontally sortable cards.
 *
 * DnD: @dnd-kit/core + @dnd-kit/sortable.
 * Each block card is wrapped in <SortableBlockCard>.
 * Drag overlay shows a ghost while dragging.
 * Cross-section moves are handled by detecting that the active
 * container differs from the over container in onDragEnd.
 */
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useEditorStore } from './useEditorStore.js';
import { BlockToolbar } from './BlockToolbar.js';
import type { BlockSchema, TemplateSection } from '@plated/types';
import styles from './BlockCanvas.module.css';

// ─── Block type display names + icons ─────────────────────────────────────

export const BLOCK_LABELS: Record<string, string> = {
  hero:               'Hero',
  text:               'Text',
  image:              'Image',
  gallery:            'Gallery',
  'menu-preview':     'Menu Preview',
  hours:              'Hours',
  map:                'Map',
  'social-feed':      'Social Feed',
  cta:                'Call to Action',
  testimonials:       'Testimonials',
  specials:           'Specials',
  'events-list':      'Events',
  'blog-list':        'Blog',
  press:              'Press',
  'delivery-links':   'Delivery Links',
  'reservation-widget': 'Reservation',
  video:              'Video',
  divider:            'Divider',
  spacer:             'Spacer',
  'custom-embed':     'Custom Embed',
};

export const BLOCK_ICONS: Record<string, string> = {
  hero:               '🏔',
  text:               '📝',
  image:              '🖼️',
  gallery:            '🖨️',
  'menu-preview':     '🍽️',
  hours:              '🕐',
  map:                '🗺️',
  'social-feed':      '📡',
  cta:                '📣',
  testimonials:       '⭐',
  specials:           '🏷️',
  'events-list':      '📅',
  'blog-list':        '📰',
  press:              '📰',
  'delivery-links':   '🛵',
  'reservation-widget': '📊',
  video:              '🎥',
  divider:            '―',
  spacer:             '↕️',
  'custom-embed':     '🧩',
};

// ─── Sortable block card ──────────────────────────────────────────────────

interface SortableBlockCardProps {
  block:     BlockSchema;
  sectionId: string;
  isSelected:  boolean;
  isHovered:   boolean;
}

function SortableBlockCard({ block, sectionId, isSelected, isHovered }: SortableBlockCardProps) {
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const hoverBlock  = useEditorStore((s) => s.hoverBlock);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: block.id, data: { sectionId, block } });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={[
        styles.blockCard,
        isSelected  ? styles.blockCardSelected  : '',
        isHovered   ? styles.blockCardHovered   : '',
        !block.visible ? styles.blockCardHidden : '',
      ].join(' ')}
      onClick={() => selectBlock(block.id)}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      <span className={styles.dragHandle} {...attributes} {...listeners}>
        ☰
      </span>
      <span className={styles.blockIcon}>{BLOCK_ICONS[block.type] ?? '📦'}</span>
      <span className={styles.blockLabel}>
        {BLOCK_LABELS[block.type] ?? block.type}
      </span>
      {!block.visible && <span className={styles.hiddenBadge}>Hidden</span>}

      {isSelected && (
        <BlockToolbar blockId={block.id} sectionId={sectionId} />
      )}
    </div>
  );
}

// ─── Ghost card for drag overlay ──────────────────────────────────────────

function GhostCard({ block }: { block: BlockSchema }) {
  return (
    <div className={`${styles.blockCard} ${styles.blockCardGhost}`}>
      <span className={styles.dragHandle}>☰</span>
      <span className={styles.blockIcon}>{BLOCK_ICONS[block.type] ?? '📦'}</span>
      <span className={styles.blockLabel}>{BLOCK_LABELS[block.type] ?? block.type}</span>
    </div>
  );
}

// ─── Section column ─────────────────────────────────────────────────────────

function SectionColumn({ section, selectedBlockId, hoveredBlockId }: {
  section: TemplateSection;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
}) {
  const sortedBlocks = [...section.blocks].sort((a, b) => a.order - b.order);
  const blockIds = sortedBlocks.map((b) => b.id);

  return (
    <div
      id={`section-${section.id}`}
      className={`${styles.section} ${!section.visible ? styles.sectionHidden : ''}`}
    >
      <div className={styles.sectionHeader}>
        <span className={styles.sectionName}>{section.name}</span>
        {!section.visible && <span className={styles.hiddenBadge}>Hidden</span>}
      </div>

      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className={styles.blockList}>
          {sortedBlocks.map((block) => (
            <SortableBlockCard
              key={block.id}
              block={block}
              sectionId={section.id}
              isSelected={selectedBlockId === block.id}
              isHovered={hoveredBlockId  === block.id}
            />
          ))}
          {sortedBlocks.length === 0 && (
            <div className={styles.emptySection}>Drop blocks here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── BlockCanvas ────────────────────────────────────────────────────────────

export function BlockCanvas() {
  const pages          = useEditorStore((s) => s.pages);
  const activePageId   = useEditorStore((s) => s.activePageId);
  const selectedBlock  = useEditorStore((s) => s.selectedBlockId);
  const hoveredBlock   = useEditorStore((s) => s.hoveredBlockId);
  const moveBlock      = useEditorStore((s) => s.moveBlock);
  const moveSectionBlock = useEditorStore((s) => s.moveSectionBlock);

  const [activeBlock, setActiveBlock] = useState<BlockSchema | null>(null);

  const activePage = pages.find((p) => p.id === activePageId);
  const sections   = activePage
    ? [...activePage.sections].sort((a, b) => a.order - b.order)
    : [];

  // Build a map: blockId → sectionId for quick lookup
  const blockSectionMap = new Map<string, string>();
  for (const s of sections) {
    for (const b of s.blocks) blockSectionMap.set(b.id, s.id);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    const block = active.data.current?.block as BlockSchema | undefined;
    setActiveBlock(block ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveBlock(null);
    if (!over || active.id === over.id) return;

    const fromSectionId = blockSectionMap.get(String(active.id));
    const toSectionId   = blockSectionMap.get(String(over.id))
      ?? (over.data.current?.sectionId as string | undefined);

    if (!fromSectionId || !toSectionId) return;

    const fromSection = sections.find((s) => s.id === fromSectionId);
    const toSection   = sections.find((s) => s.id === toSectionId);
    if (!fromSection || !toSection) return;

    const fromIndex = fromSection.blocks.findIndex((b) => b.id === String(active.id));
    const toIndex   = toSection.blocks.findIndex((b) => b.id === String(over.id));

    if (fromSectionId === toSectionId) {
      moveBlock(fromSectionId, fromIndex, toIndex === -1 ? toSection.blocks.length : toIndex);
    } else {
      moveSectionBlock(
        fromSectionId, fromIndex,
        toSectionId,   toIndex === -1 ? toSection.blocks.length : toIndex,
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.canvas}>
        {sections.length === 0 && (
          <div className={styles.empty}>
            No sections on this page. Add sections via the template manifest.
          </div>
        )}
        {sections.map((section) => (
          <SectionColumn
            key={section.id}
            section={section}
            selectedBlockId={selectedBlock}
            hoveredBlockId={hoveredBlock}
          />
        ))}
      </div>

      <DragOverlay>
        {activeBlock ? <GhostCard block={activeBlock} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
