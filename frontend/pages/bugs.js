import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function BugsPage() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isStaff, setIsStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/bugs`);
      const json = await response.json();
      setBugs(json);
    } catch (error) {
      console.error('Failed to load bugs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authAdmin = localStorage.getItem('auth_admin');
    const authMaintenance = localStorage.getItem('auth_maintenance');
    setIsStaff(!!authAdmin || !!authMaintenance);
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage(`อัปเดตสถานะเป็น "${status}" แล้ว`);
        setTimeout(() => setMessage(''), 3000);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCompleted = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบั๊กที่ "เสร็จงาน" ทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=bugs`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        setMessage(`เคลียร์ประวัติบั๊กสำเร็จ (${json.deletedCount} รายการ)`);
        setTimeout(() => setMessage(''), 5000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status) => 'var(--primary)';
  const getStatusBg = (status) => 'var(--primary-light)';

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('auth_admin');

  return (
    <Layout title="รายงานบั๊กทั้งหมด" subtitle="ติดตามและจัดการบั๊กของระบบ">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        {isStaff ? (
          <Link href="/admin" className={styles.secondaryButton}>กลับแผงควบคุม</Link>
        ) : (
          <Link href="/user" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
        )}
        {isAdmin && (
          <button className={styles.dangerButton} style={{ marginLeft: 'auto' }} onClick={handleClearCompleted}>
            ลบประวัติที่เสร็จสิ้นแล้ว
          </button>
        )}
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : bugs.length === 0 ? (
        <p>ยังไม่มีรายงานบั๊ก</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>วันที่แจ้ง</th>
                <th>หัวข้อ / รายละเอียด</th>
                <th>สถานะ</th>
                <th>อัปเดตสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b._id}>
                  <td>{new Date(b.submittedAt).toLocaleDateString('th-TH')}</td>
                  <td>
                    <strong>{b.topic}</strong><br/>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{b.message}</span>
                  </td>
                  <td>
                    <span style={{
                      background: getStatusBg(b.status),
                      color: getStatusColor(b.status),
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {isStaff && b.status !== 'เสร็จงาน' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className={styles.smallButton}
                          onClick={() => handleUpdateStatus(b._id, 'กำลังดำเนินการ')}
                        >
                          รับเรื่อง
                        </button>
                        <button 
                          className={styles.smallButton}
                          style={{ background: '#10b981', color: 'white' }}
                          onClick={() => handleUpdateStatus(b._id, 'เสร็จงาน')}
                        >
                          แก้ไขเสร็จสิ้น
                        </button>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
