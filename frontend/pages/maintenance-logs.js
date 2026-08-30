import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function MaintenanceLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/maintenance`);
      const json = await response.json();
      setLogs(json);
    } catch (error) {
      console.error('Failed to load logs', error);
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

  const handleClear = async () => {
    if (!localStorage.getItem('auth_admin')) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบประวัติได้');
      return;
    }
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติการบำรุงรักษาทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=maintenance`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout title="ประวัติการบำรุงรักษาทั้งหมด" subtitle="รายการประวัติการซ่อมบำรุงและล้างถัง">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        {isStaff ? (
          <Link href="/maintenance" className={styles.secondaryButton}>กลับแผงควบคุม</Link>
        ) : (
          <Link href="/user" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
        )}
        {typeof window !== 'undefined' && localStorage.getItem('auth_admin') && (
          <button className={styles.dangerButton} style={{ marginLeft: 'auto' }} onClick={handleClear}>
            ลบประวัติทั้งหมด
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : logs.length === 0 ? (
        <div className={styles.card}>
          <p>ไม่มีประวัติการบำรุงรักษา</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>วันที่</th>
                <th>เหตุผล / หัวข้อ</th>
                <th>รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.date ? new Date(log.date).toLocaleDateString('th-TH') : '-'}</td>
                  <td><strong>{log.reason}</strong></td>
                  <td>{log.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
