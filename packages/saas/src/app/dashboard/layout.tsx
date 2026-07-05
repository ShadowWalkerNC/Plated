import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>NexCMS</Link>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Projects</Link>
          <Link href="/dashboard/account" className={styles.navLink}>Account</Link>
        </nav>

        <div className={styles.userRow}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
