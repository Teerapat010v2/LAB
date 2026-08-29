import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import navStyles from '../styles/Layout.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>ระบบจัดการน้ำประปาหมู่บ้าน</title>
        <meta name="description" content="ระบบจัดการน้ำประปาหมู่บ้าน" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navbar */}
      <nav className={navStyles.navbar}>
        <div className={navStyles.navInner}>
          <span className={navStyles.brand}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6 2 2 8 2 14a10 10 0 0020 0c0-6-4-12-10-12z"/>
            </svg>
            <span>ระบบน้ำประปาหมู่บ้าน</span>
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6 2 2 8 2 14a10 10 0 0020 0c0-6-4-12-10-12z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            ระบบจัดการน้ำประปาหมู่บ้าน
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
            กรุณาเลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: '780px', margin: '0 auto' }}>

          {/* Villager */}
          <Link href="/user" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,105,161,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <img src="/icon_villager.png" alt="ชาวบ้าน" style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem' }}>ชาวบ้าน</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>ตรวจสอบคุณภาพน้ำและแจ้งปัญหา</p>
            </div>
          </Link>

          {/* Maintenance */}
          <Link href="/login?role=maintenance" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,105,161,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <img src="/icon_Operations.png" alt="ผู้ดูแล" style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem' }}>ผู้ดูแลระบบประปา</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>บันทึกการล้างถัง วางแผน และจัดการระบบ</p>
            </div>
          </Link>

          {/* Admin */}
          <Link href="/login?role=admin" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,105,161,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <img src="/admin_icon.png" alt="แอดมิน" style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem' }}>แอดมิน</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>แผงควบคุมระบบหลังบ้านทั้งหมด</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className={navStyles.footer}>
        <p>ระบบจัดการน้ำประปาหมู่บ้าน &copy; {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}
