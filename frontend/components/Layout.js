import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

const navLinks = [
  { href: '/user', label: 'บริการประชาชน', roles: ['public'] },
  { href: '/history', label: 'ประวัติการบำรุงรักษา', roles: ['public'] },
  { href: '/maintenance', label: 'ผู้ดูแลระบบประปา', roles: ['maintenance', 'admin'] },
  { href: '/admin', label: 'แผงควบคุม Admin', roles: ['admin'] },
  { href: '/device', label: 'ตั้งค่าอุปกรณ์', roles: ['admin'] },
];

export default function Layout({ children, title, subtitle }) {
  const router = useRouter();
  const [showBug, setShowBug] = useState(false);
  const [bugData, setBugData] = useState({ name: 'ผู้ใช้งานระบบ', phone: '-', topic: 'รายงานบั๊กของระบบ', message: '' });
  const [bugSaving, setBugSaving] = useState(false);
  const [bugMsg, setBugMsg] = useState('');
  const [deviceOnline, setDeviceOnline] = useState(false);

  useEffect(() => {
    const checkDeviceStatus = async () => {
      try {
        const res = await fetch(`${apiBase}/api/water`);
        if (res.ok) {
          const data = await res.json();
          const lastUpdate = new Date(data.timestamp).getTime();
          const now = Date.now();
          // ถ้ามีการอัปเดตข้อมูลภายใน 60 วินาทีที่ผ่านมา ถือว่าบอร์ดออนไลน์
          if (now - lastUpdate <= 60000) {
            setDeviceOnline(true);
          } else {
            setDeviceOnline(false);
          }
        }
      } catch (error) {
        setDeviceOnline(false);
      }
    };
    
    checkDeviceStatus();
    const interval = setInterval(checkDeviceStatus, 10000); // เช็คทุกๆ 10 วินาที
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_admin');
    localStorage.removeItem('auth_maintenance');
    router.push('/');
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    setBugSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugData),
      });
      if (res.ok) {
        setBugMsg(' ส่งรายงานระบบให้แอดมินแล้ว');
        setBugData({ ...bugData, message: '' });
        setTimeout(() => { setShowBug(false); setBugMsg(''); }, 2000);
      } else {
        setBugMsg(' ส่งไม่สำเร็จ');
      }
    } catch {
      setBugMsg(' เชื่อมต่อระบบไม่ได้');
    }
    setBugSaving(false);
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <img src="/Logo.png" alt="โลโก้" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
            <span style={{ lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, opacity: 0.85 }}>ระบบจัดการ</span>
              <span style={{ display: 'block' }}>น้ำประปาหมู่บ้าน</span>
            </span>
          </Link>
          <div className={styles.navActions} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* สถานะอุปกรณ์ */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', 
              padding: '4px 10px', borderRadius: '20px',
              backgroundColor: deviceOnline ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${deviceOnline ? '#a7f3d0' : '#fecaca'}`,
              marginRight: '8px'
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: deviceOnline ? '#10b981' : '#ef4444',
                boxShadow: deviceOnline ? '0 0 6px #10b981' : '0 0 6px #ef4444'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: deviceOnline ? '#059669' : '#dc2626' }}>
                {deviceOnline ? 'เครื่องทำงานปกติ' : 'เครื่องออฟไลน์'}
              </span>
            </div>

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
        <p>ระบบดูแลน้ำประปาหมู่บ้าน โดยนักศึกษามหาวิทยาลัยราชภัฏบุรีรัมย์ สาขาเทคโนโลยีสารสนเทศ</p>
      </footer>

      {/* Floating Bug Report Button */}
      <button 
        onClick={() => setShowBug(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: '#dc2626', color: '#fff', border: 'none',
          borderRadius: '50px', padding: '10px 16px',
          boxShadow: '0 4px 12px rgba(220,38,38,0.4)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontWeight: 600, fontSize: '0.85rem', zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        รายงานระบบ
      </button>

      {/* Bug Report Modal */}
      {showBug && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              รายงานปัญหาระบบ
            </h3>
            
            {bugMsg ? (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                {bugMsg}
              </div>
            ) : (
              <form onSubmit={handleBugSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>อาการที่พบ (อธิบายสั้นๆ)</label>
                  <textarea 
                    value={bugData.message}
                    onChange={(e) => setBugData({...bugData, message: e.target.value})}
                    placeholder="เช่น กดปุ่มแล้วไม่ทำงาน, หน้าจอขาว, ค่าแสดงผลผิด..."
                    rows={4} required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={bugSaving} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                    {bugSaving ? 'กำลังส่ง...' : 'ส่งรายงานระบบ'}
                  </button>
                  <button type="button" onClick={() => setShowBug(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
