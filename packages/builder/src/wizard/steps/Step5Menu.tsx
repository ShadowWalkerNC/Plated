import { useWizardStore } from '../../store/useWizardStore.js';
import { MenuBuilder } from '../components/MenuBuilder.js';
import styles from './Step.module.css';

export function Step5Menu() {
  const menu = useWizardStore((s) => s.schema.menu);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Menu</h1>
        <p className={styles.subtitle}>Add categories and items. Refine names, descriptions, prices, and dietary tags.</p>
      </header>
      <MenuBuilder
        value={menu.categories}
        onChange={(categories) => updateSchema({ menu: { ...menu, categories } })}
      />
    </section>
  );
}
