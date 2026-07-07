import { useMemo, useState } from 'react';
import type { MenuCategory, MenuItem, DietaryTag } from '@plated/types';
import styles from './MenuBuilder.module.css';

// ---- Constants ---------------------------------------------------------------

const ALL_DIETARY_TAGS: { tag: DietaryTag; label: string }[] = [
  { tag: 'vegetarian',       label: 'Vegetarian' },
  { tag: 'vegan',            label: 'Vegan' },
  { tag: 'gluten-free',      label: 'Gluten-free' },
  { tag: 'dairy-free',       label: 'Dairy-free' },
  { tag: 'nut-free',         label: 'Nut-free' },
  { tag: 'halal',            label: 'Halal' },
  { tag: 'kosher',           label: 'Kosher' },
  { tag: 'spicy',            label: 'Spicy' },
  { tag: 'contains-alcohol', label: 'Alcohol' },
];

function makeItem(): MenuItem {
  return {
    id:           crypto.randomUUID(),
    name:         '',
    description:  '',
    price:        '',
    available:    true,
    displayOrder: 0,
    dietaryTags:  [],
  };
}

function makeCategory(): MenuCategory {
  return {
    id:           crypto.randomUUID(),
    name:         'New Category',
    description:  '',
    displayOrder: 0,
    items:        [],
  };
}

/** Reassigns displayOrder = index + 1 across the array (stable, 1-based). */
function reindex<T extends { displayOrder: number }>(arr: T[]): T[] {
  return arr.map((item, i) => ({ ...item, displayOrder: i + 1 }));
}

/** Swaps elements at positions i and j. */
function swap<T>(arr: T[], i: number, j: number): T[] {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ---- Props -------------------------------------------------------------------

interface MenuBuilderProps {
  value:    MenuCategory[];
  onChange: (value: MenuCategory[]) => void;
}

// ---- Component ---------------------------------------------------------------

export function MenuBuilder({ value, onChange }: MenuBuilderProps) {
  // Sort by displayOrder before rendering so UI always reflects order.
  const categories = useMemo(
    () => [...(value ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [value],
  );

  // Track which category ids are collapsed (absent = open by default).
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);

  // ---- Category mutations ----------------------------------------------------

  function addCategory() {
    const cat = makeCategory();
    const next = reindex([...categories, cat]);
    onChange(next);
    setOpenMap((m) => ({ ...m, [cat.id]: true }));
  }

  function removeCategory(ci: number) {
    onChange(reindex(categories.filter((_, idx) => idx !== ci)));
  }

  function patchCategory(ci: number, patch: Partial<MenuCategory>) {
    onChange(
      categories.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)),
    );
  }

  function moveCategoryUp(ci: number) {
    onChange(reindex(swap(categories, ci, ci - 1)));
  }

  function moveCategoryDown(ci: number) {
    onChange(reindex(swap(categories, ci, ci + 1)));
  }

  // ---- Item mutations --------------------------------------------------------

  function addItem(ci: number) {
    const item = makeItem();
    const cat  = categories[ci];
    patchCategory(ci, { items: reindex([...cat.items, item]) });
  }

  function removeItem(ci: number, ii: number) {
    patchCategory(ci, {
      items: reindex(categories[ci].items.filter((_, idx) => idx !== ii)),
    });
  }

  function patchItem(ci: number, ii: number, patch: Partial<MenuItem>) {
    patchCategory(ci, {
      items: categories[ci].items.map((item, idx) =>
        idx === ii ? { ...item, ...patch } : item,
      ),
    });
  }

  function moveItemUp(ci: number, ii: number) {
    patchCategory(ci, { items: reindex(swap(categories[ci].items, ii, ii - 1)) });
  }

  function moveItemDown(ci: number, ii: number) {
    patchCategory(ci, { items: reindex(swap(categories[ci].items, ii, ii + 1)) });
  }

  function toggleDietaryTag(ci: number, ii: number, tag: DietaryTag) {
    const item    = categories[ci].items[ii];
    const current = item.dietaryTags ?? [];
    const next    = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    patchItem(ci, ii, { dietaryTags: next });
  }

  function toggleOpen(id: string) {
    setOpenMap((m) => ({ ...m, [id]: !m[id] }));
  }

  // ---- Render ----------------------------------------------------------------

  return (
    <div className={styles.wrap}>

      {/* ── Top bar ── */}
      <div className={styles.topRow}>
        <span className={styles.count}>
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          {totalItems > 0 && ` · ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
        </span>
        <button className={styles.addBtn} type="button" onClick={addCategory}>
          + Add Category
        </button>
      </div>

      {/* ── Empty state ── */}
      {categories.length === 0 && (
        <div className={styles.empty}>
          No categories yet. Click “+ Add Category” to get started.
        </div>
      )}

      {/* ── Category list ── */}
      <div className={styles.categoryList}>
        {categories.map((cat, ci) => {
          const isOpen = openMap[cat.id] !== false; // default open
          return (
            <section className={styles.catCard} key={cat.id}>

              {/* ── Category header row ── */}
              <div className={styles.catHeader}>
                <div className={styles.reorderCol}>
                  <button
                    className={styles.reorderBtn}
                    type="button"
                    disabled={ci === 0}
                    onClick={() => moveCategoryUp(ci)}
                    aria-label="Move category up"
                  >▲</button>
                  <button
                    className={styles.reorderBtn}
                    type="button"
                    disabled={ci === categories.length - 1}
                    onClick={() => moveCategoryDown(ci)}
                    aria-label="Move category down"
                  >▼</button>
                </div>

                <input
                  className={styles.catName}
                  value={cat.name}
                  placeholder="Category name"
                  onChange={(e) => patchCategory(ci, { name: e.target.value })}
                />

                <div className={styles.catActions}>
                  <button
                    className={styles.collapseBtn}
                    type="button"
                    onClick={() => toggleOpen(cat.id)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Collapse category' : 'Expand category'}
                  >
                    {isOpen ? '▾' : '▸'}
                  </button>
                  <button
                    className={styles.removeBtn}
                    type="button"
                    onClick={() => removeCategory(ci)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* ── Collapsible body ── */}
              {isOpen && (
                <div className={styles.catBody}>
                  <textarea
                    className={styles.catDesc}
                    value={cat.description ?? ''}
                    rows={2}
                    placeholder="Optional category description"
                    onChange={(e) => patchCategory(ci, { description: e.target.value })}
                  />

                  {/* ── Items ── */}
                  <div className={styles.items}>
                    {cat.items
                      .slice()
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((item, ii) => (
                        <div className={styles.itemCard} key={item.id}>

                          {/* ── Item top row: reorder | name | price | remove ── */}
                          <div className={styles.itemRow}>
                            <div className={styles.reorderCol}>
                              <button
                                className={styles.reorderBtn}
                                type="button"
                                disabled={ii === 0}
                                onClick={() => moveItemUp(ci, ii)}
                                aria-label="Move item up"
                              >▲</button>
                              <button
                                className={styles.reorderBtn}
                                type="button"
                                disabled={ii === cat.items.length - 1}
                                onClick={() => moveItemDown(ci, ii)}
                                aria-label="Move item down"
                              >▼</button>
                            </div>
                            <input
                              className={styles.itemName}
                              value={item.name}
                              placeholder="Item name"
                              onChange={(e) => patchItem(ci, ii, { name: e.target.value })}
                            />
                            <input
                              className={styles.itemPrice}
                              value={item.price ?? ''}
                              placeholder="$18"
                              onChange={(e) => patchItem(ci, ii, { price: e.target.value })}
                            />
                            <button
                              className={styles.removeInline}
                              type="button"
                              onClick={() => removeItem(ci, ii)}
                              aria-label="Remove item"
                            >×</button>
                          </div>

                          {/* ── Description ── */}
                          <textarea
                            className={styles.itemDesc}
                            value={item.description ?? ''}
                            rows={2}
                            placeholder="Item description"
                            onChange={(e) => patchItem(ci, ii, { description: e.target.value })}
                          />

                          {/* ── Image URL ── */}
                          <input
                            className={styles.itemImageUrl}
                            value={item.imageUrl ?? ''}
                            placeholder="Image URL (optional)"
                            onChange={(e) => patchItem(ci, ii, { imageUrl: e.target.value })}
                          />

                          {/* ── Available toggle ── */}
                          <div className={styles.itemMeta}>
                            <label className={styles.availRow}>
                              <input
                                className={styles.availCheck}
                                type="checkbox"
                                checked={item.available !== false}
                                onChange={(e) => patchItem(ci, ii, { available: e.target.checked })}
                              />
                              <span>{item.available !== false ? 'Available' : 'Hidden'}</span>
                            </label>
                          </div>

                          {/* ── Dietary tag pills ── */}
                          <div className={styles.tagPicker}>
                            {ALL_DIETARY_TAGS.map(({ tag, label }) => {
                              const active = (item.dietaryTags ?? []).includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  className={active ? styles.tagPillActive : styles.tagPill}
                                  onClick={() => toggleDietaryTag(ci, ii, tag)}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      ))}
                  </div>

                  <button
                    className={styles.addSubBtn}
                    type="button"
                    onClick={() => addItem(ci)}
                  >
                    + Add Item
                  </button>
                </div>
              )}

            </section>
          );
        })}
      </div>
    </div>
  );
}
