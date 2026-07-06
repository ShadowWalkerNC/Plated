/**
 * useEditorStore — Zustand store for the block DnD editor.
 *
 * Owns pages[], activePage index, selected/hovered block IDs.
 * All mutations keep displayOrder integers in sync.
 * onChange(pages) is called after every mutation so the caller
 * can flush changes back into useWizardStore via updateSchema.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { TemplateSection, BlockSchema, BlockType } from '@plated/types';

export interface EditorPage {
  id: string;
  path: string;
  title: string;
  sections: TemplateSection[];
}

export interface EditorStore {
  pages: EditorPage[];
  activePageId: string | null;
  selectedBlockId: string | null;
  hoveredBlockId:  string | null;

  // Init
  initFromPages: (pages: EditorPage[], onChange: (pages: EditorPage[]) => void) => void;

  // Navigation
  setActivePage:  (pageId: string) => void;
  selectBlock:    (blockId: string | null) => void;
  hoverBlock:     (blockId: string | null) => void;

  // Block moves within a section
  moveBlock: (sectionId: string, fromIndex: number, toIndex: number) => void;

  // Block moves across sections
  moveSectionBlock: (
    fromSectionId: string, fromIndex: number,
    toSectionId:   string, toIndex:   number,
  ) => void;

  // Block mutations
  toggleBlockVisible:  (blockId: string) => void;
  updateBlockConfig:   (blockId: string, patch: Record<string, unknown>) => void;
  addBlock:            (sectionId: string, type: BlockType) => void;
  removeBlock:         (blockId: string) => void;
  duplicateBlock:      (blockId: string) => void;
  moveBlockUp:         (blockId: string) => void;
  moveBlockDown:       (blockId: string) => void;

  // Section mutations
  reorderSection:      (fromIndex: number, toIndex: number) => void;
  toggleSectionVisible:(sectionId: string) => void;
}

let _onChange: ((pages: EditorPage[]) => void) | null = null;

function notify(pages: EditorPage[]) {
  _onChange?.(pages);
}

function reindex(blocks: BlockSchema[]): BlockSchema[] {
  return blocks.map((b, i) => ({ ...b, order: i }));
}

function mutatePage(
  pages: EditorPage[],
  pageId: string | null,
  fn: (page: EditorPage) => EditorPage,
): EditorPage[] {
  return pages.map((p) => (p.id === pageId ? fn(p) : p));
}

function mutateSection(
  page: EditorPage,
  sectionId: string,
  fn: (s: TemplateSection) => TemplateSection,
): EditorPage {
  return {
    ...page,
    sections: page.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  };
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    pages: [],
    activePageId:    null,
    selectedBlockId: null,
    hoveredBlockId:  null,

    initFromPages: (pages, onChange) => {
      _onChange = onChange;
      set({ pages, activePageId: pages[0]?.id ?? null });
    },

    setActivePage:  (pageId) => set({ activePageId: pageId, selectedBlockId: null }),
    selectBlock:    (blockId) => set({ selectedBlockId: blockId }),
    hoverBlock:     (blockId) => set({ hoveredBlockId: blockId }),

    moveBlock: (sectionId, fromIndex, toIndex) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) =>
        mutateSection(page, sectionId, (s) => {
          const blocks = [...s.blocks];
          const [moved] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, moved);
          return { ...s, blocks: reindex(blocks) };
        }),
      );
      set({ pages: next });
      notify(next);
    },

    moveSectionBlock: (fromSectionId, fromIndex, toSectionId, toIndex) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => {
        let movedBlock: BlockSchema | null = null;
        const withRemoval = {
          ...page,
          sections: page.sections.map((s) => {
            if (s.id !== fromSectionId) return s;
            const blocks = [...s.blocks];
            [movedBlock] = blocks.splice(fromIndex, 1);
            return { ...s, blocks: reindex(blocks) };
          }),
        };
        if (!movedBlock) return page;
        const block = movedBlock;
        return {
          ...withRemoval,
          sections: withRemoval.sections.map((s) => {
            if (s.id !== toSectionId) return s;
            const blocks = [...s.blocks];
            blocks.splice(toIndex, 0, block);
            return { ...s, blocks: reindex(blocks) };
          }),
        };
      });
      set({ pages: next });
      notify(next);
    },

    toggleBlockVisible: (blockId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => ({
          ...s,
          blocks: s.blocks.map((b) =>
            b.id === blockId ? { ...b, visible: !b.visible } : b,
          ),
        })),
      }));
      set({ pages: next });
      notify(next);
    },

    updateBlockConfig: (blockId, patch) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => ({
          ...s,
          blocks: s.blocks.map((b) =>
            b.id === blockId ? { ...b, config: { ...b.config, ...patch } } : b,
          ),
        })),
      }));
      set({ pages: next });
      notify(next);
    },

    addBlock: (sectionId, type) => {
      const { pages, activePageId } = get();
      const newBlock: BlockSchema = {
        id: crypto.randomUUID(),
        type,
        order: 999,
        visible: true,
        config: {},
      };
      const next = mutatePage(pages, activePageId, (page) =>
        mutateSection(page, sectionId, (s) => ({
          ...s,
          blocks: reindex([...s.blocks, newBlock]),
        })),
      );
      set({ pages: next });
      notify(next);
    },

    removeBlock: (blockId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => ({
          ...s,
          blocks: reindex(s.blocks.filter((b) => b.id !== blockId)),
        })),
      }));
      set({ pages: next, selectedBlockId: null });
      notify(next);
    },

    duplicateBlock: (blockId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => {
          const idx = s.blocks.findIndex((b) => b.id === blockId);
          if (idx === -1) return s;
          const copy: BlockSchema = {
            ...s.blocks[idx],
            id: crypto.randomUUID(),
            config: { ...s.blocks[idx].config },
          };
          const blocks = [...s.blocks];
          blocks.splice(idx + 1, 0, copy);
          return { ...s, blocks: reindex(blocks) };
        }),
      }));
      set({ pages: next });
      notify(next);
    },

    moveBlockUp: (blockId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => {
          const idx = s.blocks.findIndex((b) => b.id === blockId);
          if (idx <= 0) return s;
          const blocks = [...s.blocks];
          [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]];
          return { ...s, blocks: reindex(blocks) };
        }),
      }));
      set({ pages: next });
      notify(next);
    },

    moveBlockDown: (blockId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) => {
          const idx = s.blocks.findIndex((b) => b.id === blockId);
          if (idx === -1 || idx >= s.blocks.length - 1) return s;
          const blocks = [...s.blocks];
          [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
          return { ...s, blocks: reindex(blocks) };
        }),
      }));
      set({ pages: next });
      notify(next);
    },

    reorderSection: (fromIndex, toIndex) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => {
        const sections = [...page.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return {
          ...page,
          sections: sections.map((s, i) => ({ ...s, order: i })),
        };
      });
      set({ pages: next });
      notify(next);
    },

    toggleSectionVisible: (sectionId) => {
      const { pages, activePageId } = get();
      const next = mutatePage(pages, activePageId, (page) => ({
        ...page,
        sections: page.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s,
        ),
      }));
      set({ pages: next });
      notify(next);
    },
  }))
);
