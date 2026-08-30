import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/plans`);
      let json = await response.json();
      
      const statusWeight = {
        'กำลังดำเนินการ': 1,
        'ตามแผน': 1,
        'เสร็จสิ้น': 2
      };
      
      json.sort((a, b) => {
        const wA = statusWeight[a.status] || 99;
        const wB = statusWeight[b.status] || 99;
        if (wA !== wB) return wA - wB;
        if (a.status === 'เสร็จสิ้น') {
          return new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime(); // Newest completed first
        }
        return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime(); // Earliest upcoming first
      });

      setPlans(json);
    } catch (error) {
      console.error('Failed to load plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const authAdmin = localStorage.getItem('auth_admin');
    const authMaintenance = localStorage.getItem('auth_maintenance');
    setIsStaff(!!authAdmin || !!authMaintenance);
    loadData();
  }, []);

  const handleClearCompleted = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนบำรุงรักษาที่ "เสร็จสิ้น" ทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=plans`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        alert('เคลียร์ประวัติแผนบำรุงรักษาสำเร็จ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('auth_admin');

  return (
    <Layout title="แผนการบำรุงรักษาทั้งหมด" subtitle="รายการแผนงานซ่อมบำรุงและล้างถังที่กำหนดไว้">
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

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : plans.length === 0 ? (
        <div className={styles.card}>
          <p>ไม่มีแผนงาน</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>วันที่กำหนด</th>
                <th>รายละเอียดงาน</th>
                <th>ผู้รับผิดชอบ</th>
                <th style={{ width: '120px' }}>สถานะ</th>
                {isStaff && <th style={{ width: '150px' }}>อัปเดตสถานะ</th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((p, idx) => (
                <tr key={p._id || idx}>
                  <td>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td><strong>{p.description}</strong></td>
                  <td>{p.assignedTo}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ 
                      background: p.status === 'เสร็จสิ้น' ? 'var(--success-light)' : 'var(--primary-light)', 
                      color: p.status === 'เสร็จสิ้น' ? 'var(--success)' : 'var(--primary)' 
                    }}>
                      {p.status}
                    </span>
                  </td>
                  {isStaff && (
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {p.status === 'ตามแผน' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(p._id, 'กำลังดำเนินการ')}>
                            กำลังดำเนินการ
                          </button>
                        )}
                        {p.status === 'กำลังดำเนินการ' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(p._id, 'เสร็จสิ้น')}>
                            เสร็จสิ้น
                          </button>
                        )}
                        {p.status === 'เสร็จสิ้น' && (
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
