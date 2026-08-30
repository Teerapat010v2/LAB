import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/history`);
      const json = await response.json();
      setHistory(json);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (!localStorage.getItem('auth_admin')) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบประวัติได้');
      return;
    }
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติทั่วไปทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=history`, { method: 'DELETE' });
      if (res.ok) {
        await loadHistory();
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout title="ประวัติการทำงานทั้งหมด" subtitle="ดูรายการบำรุงรักษาและประวัติการดำเนินงานย้อนหลัง">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadHistory}>
          รีเฟรชประวัติ
        </button>
        <button className={styles.secondaryButton} onClick={() => window.history.back()}>
          ย้อนกลับ
        </button>
        {typeof window !== 'undefined' && localStorage.getItem('auth_admin') && (
          <button className={styles.dangerButton} style={{ marginLeft: 'auto' }} onClick={handleClear}>
            ลบประวัติทั้งหมด
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : history.length === 0 ? (
        <div className={styles.card}>
          <p>ยังไม่มีประวัติ</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>วันที่</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</td>
                  <td>{item.note || item.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
