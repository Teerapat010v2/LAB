import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function WaterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/water`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h1>ข้อมูลน้ำปัจจุบัน</h1>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <div className={styles.card}>
          <p>ความขุ่น: {data?.turbidity ?? '-'} NTU</p>
          <p>สถานะ: {data?.status ?? '-'}</p>
        </div>
      )}
    </div>
  );
}
