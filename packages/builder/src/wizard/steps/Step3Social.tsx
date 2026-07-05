import { Field } from '../components/Field.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import styles from './Step.module.css';

export function Step3Social() {
  const social = useWizardStore((s) => s.schema.social);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  const rows: Array<[keyof typeof social, string, string]> = [
    ['instagram', 'Instagram', 'https://instagram.com/yourhandle'],
    ['facebook', 'Facebook', 'https://facebook.com/yourpage'],
    ['twitter', 'Twitter / X', 'https://x.com/yourhandle'],
    ['googleBusiness', 'Google Business', 'https://g.page/...'],
    ['yelp', 'Yelp', 'https://yelp.com/biz/...'],
    ['tripadvisor', 'Tripadvisor', 'https://tripadvisor.com/...'],
    ['doordash', 'DoorDash', 'https://doordash.com/store/...'],
    ['ubereats', 'Uber Eats', 'https://ubereats.com/store/...'],
    ['grubhub', 'Grubhub', 'https://grubhub.com/restaurant/...'],
    ['toast', 'Toast', 'https://order.toasttab.com/...'],
    ['chownow', 'ChowNow', 'https://direct.chownow.com/order/...'],
  ];

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Social & Listings</h1>
        <p className={styles.subtitle}>Link your profiles, review pages, and delivery partners.</p>
      </header>

      <div className={styles.grid2}>
        {rows.map(([key, label, placeholder]) => (
          <Field key={key} label={label}>
            <input
              value={social[key]}
              onChange={(e) => updateSchema({ social: { [key]: e.target.value } })}
              placeholder={placeholder}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}
