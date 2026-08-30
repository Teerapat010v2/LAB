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
            <img src="/Logo.png" alt="โลโก้" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
            <span>ระบบน้ำประปาหมู่บ้าน</span>
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem) 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div style={{ width: 'clamp(52px, 12vw, 72px)', height: 'clamp(52px, 12vw, 72px)', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6 2 2 8 2 14a10 10 0 0020 0c0-6-4-12-10-12z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            ระบบจัดการน้ำประปาหมู่บ้าน
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: '420px', margin: '0 auto' }}>
            กรุณาเลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '720px', margin: '0 auto' }}>

          {/* Villager (Highlighted) */}
          <Link href="/user" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ 
              textAlign: 'center', padding: '2.5rem 1.5rem', cursor: 'pointer', 
              background: 'var(--primary)', color: 'white', border: 'none',
              transform: 'scale(1.05)', zIndex: 10,
              boxShadow: '0 10px 25px rgba(3,105,161,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' 
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(3,105,161,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(3,105,161,0.3)'; }}
            >
              <div style={{ background: 'white', padding: '10px', borderRadius: '50%', width: '100px', height: '100px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/icon_villager.png" alt="ชาวบ้าน" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 0.5rem', color: 'white' }}>ชาวบ้าน</h2>
              <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9, margin: 0 }}>ตรวจสอบคุณภาพน้ำและแจ้งปัญหา</p>
            </div>
          </Link>

          {/* Maintenance */}
          <Link href="/login?role=maintenance" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,105,161,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <img src="/icon_Operations.png" alt="ผู้ดูแล" style={{ width: 'clamp(64px, 18vw, 96px)', height: 'clamp(64px, 18vw, 96px)', objectFit: 'contain', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.3rem' }}>ผู้ดูแลระบบประปา</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>บันทึกการล้างถัง วางแผน และจัดการระบบ</p>
            </div>
          </Link>

          {/* Admin */}
          <Link href="/login?role=admin" style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,105,161,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}
            >
              <img src="/admin_icon.png" alt="แอดมิน" style={{ width: 'clamp(64px, 18vw, 96px)', height: 'clamp(64px, 18vw, 96px)', objectFit: 'contain', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.3rem' }}>แอดมิน</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>แผงควบคุมระบบหลังบ้านทั้งหมด</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className={navStyles.footer}>
        <p>ระบบจัดการน้ำประปาหมู่บ้าน โดยนักศึกษามหาวิทยาลัยราชภัฏบุรีรัมย์ สาขาเทคโนโลยีสารสนเทศ</p>
      </footer>
    </>
  );
}
