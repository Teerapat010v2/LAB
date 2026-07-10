import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/maintenance`)
      .then((res) => res.json())
      .then((json) => setRecords(json))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h1>บันทึกการบำรุงรักษา</h1>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <div>
          {records.length === 0 ? (
            <p>ยังไม่มีบันทึกการบำรุงรักษา</p>
          ) : (
            records.map((record, index) => (
              <div key={index} className={styles.card}>
                <p>วันที่: {record.date ?? '-'}</p>
                <p>เหตุผล: {record.reason ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

