import { Field } from '../components/Field.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import styles from './Step.module.css';

export function Step1Business() {
  const schema = useWizardStore((s) => s.schema);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Business Basics</h1>
        <p className={styles.subtitle}>Tell us what this restaurant is and how guests should understand it.</p>
      </header>

      <div className={styles.grid2}>
        <Field label="Business name">
          <input
            value={schema.business.name}
            onChange={(e) => updateSchema({ business: { name: e.target.value }, seo: { siteTitle: e.target.value } })}
            placeholder="Hearth & Vine"
          />
        </Field>

        <Field label="Cuisine type" hint="Used in headings, metadata, and internal organization.">
          <input
            value={schema.business.cuisineType}
            onChange={(e) => updateSchema({ business: { cuisineType: e.target.value } })}
            placeholder="Italian · Seafood · Southern"
          />
        </Field>
      </div>

      <Field label="Tagline" hint="Short brand promise shown under the name.">
        <input
          value={schema.business.tagline}
          onChange={(e) => updateSchema({ business: { tagline: e.target.value } })}
          placeholder="Wood-fired food. Warm hospitality."
        />
      </Field>

      <Field label="Description" hint="2–4 sentences about the restaurant, atmosphere, and point of view.">
        <textarea
          value={schema.business.description}
          onChange={(e) => updateSchema({ business: { description: e.target.value }, seo: { metaDescription: e.target.value.slice(0, 155) } })}
          placeholder="Describe the space, food, sourcing, and guest experience..."
        />
      </Field>

      <div className={styles.grid3}>
        <Field label="Phone">
          <input
            value={schema.business.phone}
            onChange={(e) => updateSchema({ business: { phone: e.target.value } })}
            placeholder="(555) 123-4567"
          />
        </Field>

        <Field label="Email">
          <input
            value={schema.business.email}
            onChange={(e) => updateSchema({ business: { email: e.target.value } })}
            placeholder="hello@restaurant.com"
          />
        </Field>

        <Field label="Founded year">
          <input
            value={schema.business.foundedYear}
            onChange={(e) => updateSchema({ business: { foundedYear: e.target.value } })}
            placeholder="2017"
          />
        </Field>
      </div>
    </section>
  );
}
