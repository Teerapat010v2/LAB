import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/plans`);
      const json = await response.json();
      setPlans(json);
    } catch (error) {
      console.error('Failed to load plans', error);
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

  return (
    <Layout title="แผนการบำรุงรักษาทั้งหมด" subtitle="รายการแผนงานซ่อมบำรุงและล้างถังที่กำหนดไว้">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        {isStaff ? (
          <Link href="/maintenance" className={styles.secondaryButton}>กลับแผงควบคุม</Link>
        ) : (
          <Link href="/user" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
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
              </tr>
            </thead>
            <tbody>
              {plans.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td><strong>{p.description}</strong></td>
                  <td>{p.assignedTo}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ 
                      background: p.status === 'Completed' || p.status === 'Done' ? 'var(--status-success-bg)' : 'var(--status-warning-bg)', 
                      color: p.status === 'Completed' || p.status === 'Done' ? 'var(--status-success-text)' : 'var(--status-warning-text)' 
                    }}>
                      {p.status}
                    </span>
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
