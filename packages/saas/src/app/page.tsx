import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>NexCMS</div>
        <div className={styles.navActions}>
          <SignedOut>
            <Link className={styles.ghostBtn} href="/sign-in">Sign in</Link>
            <Link className={styles.primaryBtn} href="/sign-up">Get started free</Link>
          </SignedOut>
          <SignedIn>
            <Link className={styles.primaryBtn} href="/dashboard">Dashboard</Link>
          </SignedIn>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>Restaurant websites, done right</div>
        <h1 className={styles.heroTitle}>
          From first draft<br />to live site in minutes.
        </h1>
        <p className={styles.heroTagline}>
          Answer 8 questions. Pick a theme. Deploy. NexCMS generates a fast, beautiful Astro site — ready to rank, ready to take orders.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryBtn} href="/sign-up">Start building — it&apos;s free</Link>
          <Link className={styles.ghostBtn} href="#how-it-works">See how it works</Link>
        </div>
      </section>

      <section className={styles.features} id="how-it-works">
        {[
          { step: '01', title: 'Fill the wizard', body: 'Name, menu, hours, social links, brand colors. 8 steps, 5 minutes.' },
          { step: '02', title: 'Pick a theme', body: '6 professionally designed themes. Hearth, Canvas, Midnight, Market, Coast, Ember.' },
          { step: '03', title: 'Deploy anywhere', body: 'One click to Vercel, Netlify, or Cloudflare Pages. Or download the Astro project.' },
        ].map((f) => (
          <div key={f.step} className={styles.featureCard}>
            <div className={styles.featureStep}>{f.step}</div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
