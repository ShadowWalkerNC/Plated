/**
 * useEditorStore.ts — Zustand store for the block DnD editor.
 *
 * Owns the mutable copy of sections/blocks that the editor manipulates.
 * Syncs back to the main WizardStore via updateSchema() when mutations occur.
 *
 * Rule: ALL section/block mutations go through this store.
 * The WizardStore is the persistence layer; this store is the edit layer.
 */
import { create }           from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { BlockSchema, TemplateSection } from '@plated/types';
import { useWizardStore }   from '../store/useWizardStore.js';
import { arrayMove }        from '@dnd-kit/sortable';

export interface EditorStore {
  // State
  sections:      TemplateSection[];
  activeBlockId: string | null;   // currently selected block
  activeSectionId: string | null; // currently focused/expanded section
  isDirty:       boolean;

  // Initialise from the current ProjectSchema pages[0].sections
  initFromSchema: () => void;

  // Section actions
  reorderSections:   (fromIndex: number, toIndex: number) => void;
  toggleSection:     (sectionId: string) => void;
  setActiveSection:  (sectionId: string | null) => void;

  // Block actions
  reorderBlocks:     (sectionId: string, fromIndex: number, toIndex: number) => void;
  toggleBlock:       (sectionId: string, blockId: string) => void;
  setActiveBlock:    (blockId: string | null) => void;
  updateBlockConfig: (blockId: string, patch: Record<string, unknown>) => void;

  // Flush mutations back to WizardStore
  flushToSchema: () => void;
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    sections:        [],
    activeBlockId:   null,
    activeSectionId: null,
    isDirty:         false,

    // ── initFromSchema ──────────────────────────────────────────────────────
    initFromSchema: () => {
      const schema   = useWizardStore.getState().schema;
      // Editor works on the first page for now (home page)
      const sections = (schema as any)?.pages?.[0]?.sections ?? [];
      // Deep clone so we don't mutate the store reference
      set({ sections: JSON.parse(JSON.stringify(sections)), isDirty: false });
    },

    // ── Section reorder ─────────────────────────────────────────────────────
    reorderSections: (fromIndex, toIndex) => {
      set((s) => {
        const next = arrayMove([...s.sections], fromIndex, toIndex).map(
          (sec, i) => ({ ...sec, order: i }),
        );
        return { sections: next, isDirty: true };
      });
      get().flushToSchema();
    },

    toggleSection: (sectionId) => {
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec,
        ),
        isDirty: true,
      }));
      get().flushToSchema();
    },

    setActiveSection: (sectionId) => set({ activeSectionId: sectionId }),

    // ── Block reorder ────────────────────────────────────────────────────────
    reorderBlocks: (sectionId, fromIndex, toIndex) => {
      set((s) => ({
        sections: s.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          const next = arrayMove([...sec.blocks], fromIndex, toIndex).map(
            (b, i) => ({ ...b, order: i }),
          );
          return { ...sec, blocks: next };
        }),
        isDirty: true,
      }));
      get().flushToSchema();
    },

    toggleBlock: (sectionId, blockId) => {
      set((s) => ({
        sections: s.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            blocks: sec.blocks.map((b) =>
              b.id === blockId ? { ...b, visible: !b.visible } : b,
            ),
          };
        }),
        isDirty: true,
      }));
      get().flushToSchema();
    },

    setActiveBlock: (blockId) => set({ activeBlockId: blockId }),

    updateBlockConfig: (blockId, patch) => {
      set((s) => ({
        sections: s.sections.map((sec) => ({
          ...sec,
          blocks: sec.blocks.map((b) =>
            b.id === blockId
              ? { ...b, config: { ...b.config, ...patch } }
              : b,
          ),
        })),
        isDirty: true,
      }));
      get().flushToSchema();
    },

    // ── flushToSchema ────────────────────────────────────────────────────────
    // Writes the current editor sections back into WizardStore so auto-save
    // and export always work from the latest state.
    flushToSchema: () => {
      const { sections } = get();
      const schema = useWizardStore.getState().schema as any;
      if (!schema?.pages?.[0]) return;
      useWizardStore.getState().updateSchema({
        pages: [
          { ...schema.pages[0], sections },
          ...schema.pages.slice(1),
        ],
      } as any);
      set({ isDirty: false });
    },
  }))
);
