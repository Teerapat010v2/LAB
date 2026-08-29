import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecords = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/maintenance`);
      const json = await response.json();
      setRecords(json);
    } catch (error) {
      console.error('Failed to load maintenance records', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // ตรวจสอบสิทธิ์การเข้าใช้งาน
    const isAuth = localStorage.getItem('auth_maintenance') || localStorage.getItem('auth_admin');
    if (!isAuth) {
      window.location.href = '/login?role=maintenance';
      return;
    }
    loadRecords();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>บันทึกการล้างถัง</h1>
          <p className={styles.pageIntro}>รวมการบันทึกการบำรุงรักษาและการล้างถังเพื่อให้ติดตามสถานะได้อย่างชัดเจน</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} onClick={loadRecords} disabled={refreshing}>
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชรายการ'}
          </button>
          <Link href="/history" className={styles.secondaryButton}>
            ดูประวัติย้อนหลัง
          </Link>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <div className={styles.gridTwo}>
          {records.length === 0 ? (
            <div className={styles.card}>
              <p>ยังไม่มีบันทึกการบำรุงรักษา</p>
            </div>
          ) : (
            records.map((record, index) => (
              <div key={index} className={styles.card}>
                <p><strong>วันที่:</strong> {record.date ?? '-'}</p>
                <p><strong>เหตุผล:</strong> {record.reason ?? '-'}</p>
                <p><strong>หมายเหตุ:</strong> {record.note ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

