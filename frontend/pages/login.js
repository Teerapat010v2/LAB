import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Login() {
  const router = useRouter();
  const { role } = router.query;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roleName = role === 'admin' ? 'แอดมิน' : role === 'maintenance' ? 'ผู้ดูแลระบบประปา' : 'เจ้าหน้าที่';
  const targetPath = role === 'admin' ? '/admin' : '/maintenance';

  const handleLogin = (e) => {
    e.preventDefault();
    // รหัสผ่านสำหรับการสาธิต (สามารถแก้เป็นระบบฐานข้อมูลภายหลังได้)
    const validPassword = role === 'admin' ? 'admin123' : 'staff123';

    if (password === validPassword) {
      // บันทึกสถานะการล็อกอินลง localStorage
      localStorage.setItem(`auth_${role}`, 'true');
      router.push(targetPath);
    } else {
      setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>เข้าสู่ระบบ - {roleName}</title>
      </Head>

      <main className={styles.main} style={{ justifyContent: 'center', minHeight: '80vh' }}>
        <div className={styles.card} style={{ maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>เข้าสู่ระบบ</h1>
          <h3 style={{ color: '#666', marginBottom: '2rem' }}>สำหรับ: {roleName}</h3>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            {error && <p style={{ color: 'red', margin: '0' }}>{error}</p>}
            <button type="submit" className={styles.actionButton} style={{ width: '100%' }}>
              เข้าสู่ระบบ
            </button>
            <button 
              type="button" 
              className={styles.secondaryButton} 
              style={{ width: '100%' }}
              onClick={() => router.push('/')}
            >
              กลับหน้าหลัก
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
            <p>💡 ข้อมูลสาธิต:</p>
            <p>รหัสผ่านแอดมิน: <strong>admin123</strong></p>
            <p>รหัสผ่านผู้ดูแล: <strong>staff123</strong></p>
          </div>
        </div>
      </main>
    </div>
  );
}
