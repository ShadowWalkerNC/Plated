import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createProject } from '@/lib/db/queries';
import styles from './page.module.css';

export default function NewProjectPage() {
  async function create(formData: FormData) {
    'use server';
    const { userId } = await auth();
    if (!userId) return;

    const name = (formData.get('name') as string).trim() || 'Untitled project';
    const theme = (formData.get('theme') as string) || 'hearth';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const project = await createProject({
      userId,
      name,
      slug,
      theme,
      schema: {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        businessType: 'restaurant',
        business: { name, tagline: '', description: '', cuisineType: '', phone: '', email: '', foundedYear: '', existingWebsiteUrl: '' },
        branding: { primaryColor: '#8a4b2f', secondaryColor: '#f4ede4', accentColor: '#c98f4a', logoUrl: '', heroImageUrl: '', faviconUrl: '' },
        seo: { siteTitle: name, metaDescription: '', ogImageUrl: '' },
        social: { instagram: '', facebook: '', twitter: '', googleBusiness: '', yelp: '', tripadvisor: '', doordash: '', ubereats: '', grubhub: '', toast: '', chownow: '' },
        locations: [],
        primaryLocationIndex: 0,
        menu: { categories: [] },
        extensions: {},
      },
    });

    redirect(`/dashboard/projects/${project.id}`);
  }

  const THEMES = [
    { id: 'hearth',   label: 'Hearth',   color: 'linear-gradient(135deg,#8a4b2f,#f4ede4)' },
    { id: 'canvas',   label: 'Canvas',   color: 'linear-gradient(135deg,#f0f0f0,#fff)' },
    { id: 'midnight', label: 'Midnight', color: 'linear-gradient(135deg,#151515,#4a2a22)' },
    { id: 'market',   label: 'Market',   color: 'linear-gradient(135deg,#5e8c61,#f3eddc)' },
    { id: 'coast',    label: 'Coast',    color: 'linear-gradient(135deg,#83b8d8,#f6fbff)' },
    { id: 'ember',    label: 'Ember',    color: 'linear-gradient(135deg,#2a1612,#b65a2f)' },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>New project</h1>
      <p className={styles.subtitle}>Name your project and pick a theme to start with. You can change these later.</p>

      <form action={create} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Project name</span>
          <input className={styles.input} name="name" placeholder="Hearth & Vine" autoFocus required />
        </label>

        <div className={styles.themeField}>
          <span className={styles.label}>Theme</span>
          <div className={styles.themeGrid}>
            {THEMES.map((t) => (
              <label key={t.id} className={styles.themeCard}>
                <input type="radio" name="theme" value={t.id} defaultChecked={t.id === 'hearth'} className={styles.themeRadio} />
                <div className={styles.themePreview} style={{ background: t.color }} />
                <span className={styles.themeLabel}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className={styles.submitBtn} type="submit">Create project</button>
      </form>
    </div>
  );
}
