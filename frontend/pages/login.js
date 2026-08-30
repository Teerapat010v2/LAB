import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import navStyles from '../styles/Layout.module.css';
import styles from '../styles/Home.module.css';

export default function Login() {
  const router = useRouter();
  const { role } = router.query;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleLabel = role === 'admin' ? 'แอดมิน' : 'ผู้ดูแลระบบประปา';
  const targetPath = role === 'admin' ? '/admin' : '/maintenance';
  const validPassword = role === 'admin' ? 'admin123' : 'staff123';

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (password === validPassword) {
        localStorage.setItem(`auth_${role}`, 'true');
        router.push(targetPath);
      } else {
        setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <>
      <Head><title>เข้าสู่ระบบ — {roleLabel}</title></Head>
      <nav className={navStyles.navbar}>
        <div className={navStyles.navInner}>
          <Link href="/" className={navStyles.brand}>
            <img src="/Logo.png" alt="โลโก้" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
            <span>ระบบดูแลน้ำประปาหมู่บ้าน</span>
          </Link>
          <Link href="/" className={navStyles.navBtn}>กลับหน้าหลัก</Link>
        </div>
      </nav>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div className={styles.card} style={{ padding: '2rem' }}>
            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.25rem' }}>เข้าสู่ระบบ</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>สำหรับ: {roleLabel}</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className={styles.formField}>
                <label>รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  autoFocus
                />
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.88rem', margin: '-0.5rem 0 0.75rem' }}>{error}</p>}
              <button type="submit" className={styles.actionButton} disabled={loading} style={{ width: '100%' }}>
                {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <Link href="/" className={styles.secondaryButton} style={{ width: '100%', marginTop: '0.75rem', display: 'flex' }}>
              กลับหน้าหลัก
            </Link>

            <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--bg-main)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text-main)' }}>รหัสผ่านสำหรับการสาธิต</p>
              <p style={{ margin: '0 0 0.15rem' }}>แอดมิน: <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>admin123</code></p>
              <p style={{ margin: 0 }}>ผู้ดูแล: <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>staff123</code></p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
