import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/history`);
      const json = await response.json();
      setHistory(json);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>ประวัติการล้างถังน้ำ</h1>
          <p className={styles.pageIntro}>ดูรายการล้างถังย้อนหลังทั้งหมด พร้อมเข้าถึงข้อมูลผู้ดูแลได้ง่าย</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} onClick={loadHistory} disabled={refreshing}>
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชประวัติ'}
          </button>
          <Link href="/user" className={styles.secondaryButton}>
            กลับหน้าบริการประชาชน
          </Link>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <div className={styles.gridTwo}>
          {history.length === 0 ? (
            <div className={styles.card}>
              <p>ยังไม่มีประวัติการล้างถัง</p>
            </div>
          ) : (
            history.map((item, index) => (
              <div key={index} className={styles.card}>
                <p><strong>วันที่:</strong> {item.date ?? '-'}</p>
                <p><strong>รายละเอียด:</strong> {item.note ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

