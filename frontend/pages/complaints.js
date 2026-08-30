import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isStaff, setIsStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/complaints`);
      const json = await response.json();
      setComplaints(json);
    } catch (error) {
      console.error('Failed to load complaints', error);
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
      const res = await fetch(`${apiBase}/api/complaints/${id}`, {
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
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเรื่องร้องเรียนที่ "เสร็จงาน" ทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=complaints`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        setMessage(`เคลียร์ประวัติเรื่องร้องเรียนสำเร็จ (${json.deletedCount} รายการ)`);
        setTimeout(() => setMessage(''), 5000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status) => 'var(--primary)';
  const getStatusBg = (status) => 'var(--primary-light)';

  // We only show the clear button if user is an admin.
  // Note: Since this is purely client-side, we can just check localStorage.
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('auth_admin');

  return (
    <Layout title="เรื่องร้องเรียนทั้งหมด" subtitle="ติดตามและจัดการเรื่องร้องเรียนจากชาวบ้าน">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        {isStaff ? (
          <Link href="/maintenance" className={styles.secondaryButton}>กลับแผงควบคุม</Link>
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
      ) : complaints.length === 0 ? (
        <div className={styles.card}>
          <p>ไม่มีเรื่องร้องเรียน</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>วันที่แจ้ง</th>
                <th>ผู้แจ้ง</th>
                <th>เบอร์โทร</th>
                <th>หัวข้อ / รายละเอียด</th>
                <th style={{ width: '120px' }}>สถานะ</th>
                {isStaff && <th style={{ width: '150px' }}>อัปเดตสถานะ</th>}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('th-TH') : '-'}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>
                    <strong>{c.topic}</strong>
                    <p style={{ margin: '0.2rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {c.message}
                    </p>
                  </td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: getStatusBg(c.status), color: getStatusColor(c.status) }}>
                      {c.status}
                    </span>
                  </td>
                  {isStaff && (
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(c.status === 'รอดำเนินการ' || c.status === 'Open') && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(c._id, 'รับงาน')}>
                            รับงาน
                          </button>
                        )}
                        {c.status === 'รับงาน' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(c._id, 'กำลังดำเนินการ')}>
                            กำลังดำเนินการ
                          </button>
                        )}
                        {c.status === 'กำลังดำเนินการ' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(c._id, 'เสร็จงาน')}>
                            เสร็จงาน
                          </button>
                        )}
                        {c.status === 'เสร็จงาน' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
