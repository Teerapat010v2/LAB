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

  return (
    <Layout title="บันทึกการล้างถังทั้งหมด" subtitle="รายการบันทึกการล้างถังน้ำและซ่อมบำรุง">
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
      ) : logs.length === 0 ? (
        <div className={styles.card}>
          <p>ไม่มีบันทึกการล้างถัง</p>
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
