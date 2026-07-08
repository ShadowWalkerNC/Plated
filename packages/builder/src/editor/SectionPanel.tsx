/**
 * SectionPanel.tsx — Left sidebar section list with drag-to-reorder.
 *
 * Each section row:
 *   [drag handle] [eye toggle] [name] [chevron collapse]
 *
 * Uses @dnd-kit/core DndContext + @dnd-kit/sortable SortableContext.
 * The active section (expanded) is set in useEditorStore.
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
import type { TemplateSection } from '@plated/types';
import styles               from './EditorShell.module.css';

// ── Sortable section row ────────────────────────────────────────────────────
function SortableSectionRow({ section }: { section: TemplateSection }) {
  const activeSectionId = useEditorStore((s) => s.activeSectionId);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const toggleSection    = useEditorStore((s) => s.toggleSection);

  const isActive = activeSectionId === section.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sectionRow} ${isActive ? styles.sectionRowActive : ''} ${!section.visible ? styles.sectionRowHidden : ''}`}
      onClick={() => setActiveSection(isActive ? null : section.id)}
    >
      {/* Drag handle */}
      <span
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder section"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </span>

      {/* Visibility eye */}
      <button
        className={styles.eyeBtn}
        onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
        aria-label={section.visible ? 'Hide section' : 'Show section'}
        title={section.visible ? 'Hide section' : 'Show section'}
      >
        {section.visible ? '👁' : '🚫'}
      </button>

      {/* Name */}
      <span className={styles.sectionName}>{section.name}</span>

      {/* Chevron */}
      <span className={`${styles.chevron} ${isActive ? styles.chevronOpen : ''}`}>›</span>
    </div>
  );
}

// ── Ghost row used by DragOverlay ────────────────────────────────────────────
function GhostSectionRow({ section }: { section: TemplateSection }) {
  return (
    <div className={`${styles.sectionRow} ${styles.sectionRowDragOverlay}`}>
      <span className={styles.dragHandle}>⠿</span>
      <span className={styles.sectionName}>{section.name}</span>
    </div>
  );
}

// ── SectionPanel ─────────────────────────────────────────────────────────────
export function SectionPanel() {
  const sections        = useEditorStore((s) => s.sections);
  const reorderSections = useEditorStore((s) => s.reorderSections);
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
    const fromIdx = sections.findIndex((s) => s.id === active.id);
    const toIdx   = sections.findIndex((s) => s.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1) reorderSections(fromIdx, toIdx);
  }

  const draggingSection = draggingId
    ? sections.find((s) => s.id === draggingId) ?? null
    : null;

  return (
    <div className={styles.sectionPanel}>
      <h2 className={styles.panelHeading}>Sections</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableSectionRow key={section.id} section={section} />
          ))}
        </SortableContext>

        <DragOverlay>
          {draggingSection
            ? <GhostSectionRow section={draggingSection} />
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
