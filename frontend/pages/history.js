import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/history`)
      .then((res) => res.json())
      .then((json) => setHistory(json))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h1>ประวัติการล้างถัง</h1>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <div>
          {history.length === 0 ? (
            <p>ยังไม่มีประวัติการล้างถัง</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className={styles.card}>
                <p>วันที่: {item.date ?? '-'}</p>
                <p>รายละเอียด: {item.note ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
