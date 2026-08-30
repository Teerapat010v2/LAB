import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

const getTurbidityInfo = (value) => {
  if (value == null || isNaN(value)) {
    return { label: 'ไม่ทราบ', className: styles.statusLow, fillWidth: '0%' };
  }

  if (value < 5) {
    return { label: 'ใสสะอาด', className: styles.statusLow, fillWidth: '20%' };
  }
  if (value < 10) {
    return { label: 'ค่อนข้างใส', className: styles.statusMedium, fillWidth: '45%' };
  }
  if (value < 20) {
    return { label: 'ขุ่นเล็กน้อย', className: styles.statusHigh, fillWidth: '70%' };
  }
  return { label: 'ขุ่นมาก', className: styles.statusCritical, fillWidth: '100%' };
};

export default function WaterPage() {
  const [water, setWater] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [waterJson, alertJson] = await Promise.all([
        fetch(`${apiBase}/api/water`).then((res) => res.json()),
        fetch(`${apiBase}/api/alert`).then((res) => res.json()),
      ]);
      setWater(waterJson);
      setAlerts(alertJson.alerts ?? []);
      setContact(alertJson.contact ?? null);
    } catch (error) {
      console.error('Failed to load water data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const turbidityInfo = getTurbidityInfo(water?.turbidity);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>สถานะคุณภาพน้ำ</h1>
          <p className={styles.pageIntro}>ตรวจสอบคุณภาพน้ำและระดับความขุ่น พร้อมดูสถานะล่าสุดได้ทันที</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} onClick={loadData} disabled={refreshing}>
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
          </button>
          <Link href="/history" className={styles.secondaryButton}>
            ดูประวัติการล้างถัง
          </Link>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className={styles.waterCard}>
            <div className={styles.sectionTitle}>
              <h2>สรุปสถานะน้ำ</h2>
              <span className={`${styles.statusBadge} ${turbidityInfo.className}`}>{turbidityInfo.label}</span>
            </div>
            <div className={styles.waterRow}>
              <div className={styles.metric}>
                <span>ความขุ่น (NTU)</span>
                <strong>{water?.turbidity ?? '-'}</strong>
              </div>
              <div className={styles.metric}>
                <span>เกณฑ์เตือน</span>
                <strong>{water?.threshold ?? '-'}</strong>
              </div>
            </div>
            <div className={styles.turbidityMeter}>
              <div className={styles.turbidityBar}>
                <div className={styles.turbidityFill} style={{ width: turbidityInfo.fillWidth, background: water?.turbidity >= 20 ? '#be123c' : water?.turbidity >= 10 ? '#ca8a04' : water?.turbidity >= 5 ? '#b45309' : '#047857' }} />
              </div>
              <div className={styles.metric}>
                <span>สถานะ</span>
                <strong>{water?.status ?? '-'}</strong>
              </div>
              <div className={styles.metric}>
                <span>อัปเดตล่าสุด</span>
                <strong>{water?.timestamp ? new Date(water.timestamp).toLocaleString() : '-'}</strong>
              </div>
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>การแจ้งเตือน</h2>
              </div>
              {alerts.length === 0 ? (
                <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
              ) : (
                alerts.map((alert, index) => (
                  <div key={index} className={styles.alertCard}>
                    <p>
                      <strong>{alert.type}</strong> - {alert.message}
                    </p>
                    <p className={alert.active ? styles.statusActive : styles.statusNormal}>
                      {alert.active ? 'สถานะ: ต้องการการดูแล' : 'สถานะ: ปกติ'}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>ผู้ดูแลระบบ</h2>
              </div>
              <p>ชื่อ: {contact?.name ?? '-'}</p>
              <p>เบอร์โทร: {contact?.phone ?? '-'}</p>
              <p>หมายเหตุ: {contact?.note ?? '-'}</p>
              <p className={styles.smallNote}>ติดต่อผู้ดูแลหากต้องการความช่วยเหลือเพิ่มเติม</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

