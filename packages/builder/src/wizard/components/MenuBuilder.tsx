import { useMemo } from 'react';
import styles from './MenuBuilder.module.css';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  dietaryTags?: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuBuilderProps {
  value: MenuCategory[];
  onChange: (value: MenuCategory[]) => void;
}

export function MenuBuilder({ value, onChange }: MenuBuilderProps) {
  const categories = useMemo(() => value ?? [], [value]);

  function addCategory() {
    onChange([...categories, { id: crypto.randomUUID(), name: 'New Category', description: '', items: [] }]);
  }

  function patchCategory(i: number, patch: Partial<MenuCategory>) {
    onChange(categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function removeCategory(i: number) {
    onChange(categories.filter((_, idx) => idx !== i));
  }

  function addItem(ci: number) {
    const cat = categories[ci];
    patchCategory(ci, {
      items: [...cat.items, { id: crypto.randomUUID(), name: 'New Item', description: '', price: '', dietaryTags: [] }],
    });
  }

  function patchItem(ci: number, ii: number, patch: Partial<MenuItem>) {
    patchCategory(ci, { items: categories[ci].items.map((item, idx) => (idx === ii ? { ...item, ...patch } : item)) });
  }

  function removeItem(ci: number, ii: number) {
    patchCategory(ci, { items: categories[ci].items.filter((_, idx) => idx !== ii) });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <span className={styles.count}>{categories.length} {categories.length === 1 ? 'category' : 'categories'}</span>
        <button className={styles.addBtn} type="button" onClick={addCategory}>+ Add Category</button>
      </div>

      {categories.length === 0 && (
        <div className={styles.empty}>No categories yet. Add your first one above.</div>
      )}

      <div className={styles.categoryList}>
        {categories.map((cat, ci) => (
          <section className={styles.catCard} key={cat.id}>
            <div className={styles.catHeader}>
              <input className={styles.catName} value={cat.name}
                onChange={(e) => patchCategory(ci, { name: e.target.value })} />
              <button className={styles.removeBtn} type="button" onClick={() => removeCategory(ci)}>Remove</button>
            </div>

            <textarea className={styles.catDesc} value={cat.description ?? ''} rows={2}
              placeholder="Optional category description"
              onChange={(e) => patchCategory(ci, { description: e.target.value })} />

            <div className={styles.items}>
              {cat.items.map((item, ii) => (
                <div className={styles.itemCard} key={item.id}>
                  <div className={styles.itemRow}>
                    <input className={styles.itemName} value={item.name} placeholder="Item name"
                      onChange={(e) => patchItem(ci, ii, { name: e.target.value })} />
                    <input className={styles.itemPrice} value={item.price ?? ''} placeholder="$18"
                      onChange={(e) => patchItem(ci, ii, { price: e.target.value })} />
                    <button className={styles.removeInline} type="button" onClick={() => removeItem(ci, ii)}>×</button>
                  </div>
                  <textarea className={styles.itemDesc} value={item.description ?? ''} rows={2}
                    placeholder="Item description"
                    onChange={(e) => patchItem(ci, ii, { description: e.target.value })} />
                  <input className={styles.itemTags}
                    value={(item.dietaryTags ?? []).join(', ')}
                    placeholder="vegan, gluten-free, spicy"
                    onChange={(e) => patchItem(ci, ii, {
                      dietaryTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })} />
                </div>
              ))}
            </div>

            <button className={styles.addSubBtn} type="button" onClick={() => addItem(ci)}>+ Add Item</button>
          </section>
        ))}
      </div>
    </div>
  );
}
