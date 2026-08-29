import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

const navLinks = [
  { href: '/user', label: 'บริการประชาชน', roles: ['public'] },
  { href: '/history', label: 'ประวัติการบำรุงรักษา', roles: ['public'] },
  { href: '/maintenance', label: 'ผู้ดูแลระบบประปา', roles: ['maintenance', 'admin'] },
  { href: '/admin', label: 'แผงควบคุม Admin', roles: ['admin'] },
  { href: '/device', label: 'ตั้งค่าอุปกรณ์', roles: ['admin'] },
];

export default function Layout({ children, title, subtitle }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_admin');
    localStorage.removeItem('auth_maintenance');
    router.push('/');
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6 2 2 8 2 14a10 10 0 0020 0c0-6-4-12-10-12z"/>
            </svg>
            <span>ระบบน้ำประปาหมู่บ้าน</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/" className={styles.navBtn}>หน้าหลัก</Link>
            <button onClick={handleLogout} className={styles.navBtnOutline}>ออกจากระบบ</button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className={styles.main}>
        {(title || subtitle) && (
          <div className={styles.pageHeader}>
            {title && <h1 className={styles.pageTitle}>{title}</h1>}
            {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>ระบบจัดการน้ำประปาหมู่บ้าน &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
