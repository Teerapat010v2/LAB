import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function UserPage() {
  const [water, setWater] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaint, setComplaint] = useState({ name: '', phone: '', topic: '', message: '' });
  const [complaintMessage, setComplaintMessage] = useState('');
  const [complaintSaving, setComplaintSaving] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [waterJson, alertJson, adminsJson, maintenanceJson] = await Promise.all([
        fetch(`${apiBase}/api/water`).then((res) => res.json()),
        fetch(`${apiBase}/api/alert`).then((res) => res.json()),
        fetch(`${apiBase}/api/admins`).then((res) => res.json()),
        fetch(`${apiBase}/api/maintenance`).then((res) => res.json()),
      ]);
      setWater(waterJson);
      setAlerts(alertJson.alerts || []);
      setAdmins(adminsJson || []);
      setMaintenance(maintenanceJson.slice(0, 3));
    } catch (error) {
      console.error('Failed to load user page data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field) => (event) => {
    setComplaint((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setComplaintSaving(true);
    setComplaintMessage('');

    const response = await fetch(`${apiBase}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint),
    });

    if (response.ok) {
      setComplaint({ name: '', phone: '', topic: '', message: '' });
      setComplaintMessage('ส่งเรื่องร้องเรียนเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็ว');
    } else {
      setComplaintMessage('เกิดข้อผิดพลาดในการส่งร้องเรียน กรุณาลองใหม่อีกครั้ง');
    }
    setComplaintSaving(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>ระบบบริการประชาชน</h1>
          <p className={styles.pageIntro}>ตรวจสอบคุณภาพน้ำ แจ้งเรื่องร้องเรียน และติดตามประวัติการบำรุงรักษา</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} onClick={loadData} disabled={refreshing}>
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>สถานะน้ำ</h2>
                <span className={styles.statusBadge}>{water?.status ?? 'ไม่ทราบ'}</span>
              </div>
              <p>ความขุ่น: <strong>{water?.turbidity ?? '-'}</strong> NTU</p>
              <p>ระดับ: <strong>{water?.level ?? '-'}</strong></p>
              <p>ข้อความ: {water?.message ?? '-'}</p>
              <p>อัปเดตล่าสุด: {water?.timestamp ? new Date(water.timestamp).toLocaleString() : '-'}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>การแจ้งเตือน</h2>
              </div>
              {alerts.length === 0 ? (
                <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
              ) : (
                alerts.map((alert, index) => (
                  <div key={index} className={styles.alertCard}>
                    <p><strong>{alert.type}</strong></p>
                    <p>{alert.message}</p>
                    <p className={alert.active ? styles.statusActive : styles.statusNormal}>
                      {alert.active ? 'สถานะ: ต้องตรวจสอบ' : 'สถานะ: ปกติ'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>สรุปการบำรุงรักษา</h2>
              <Link href="/maintenance" className={styles.secondaryButton}>
                ดูรายการบำรุงรักษา
              </Link>
            </div>
            {maintenance.length === 0 ? (
              <p>ยังไม่มีบันทึกการซ่อมบำรุง</p>
            ) : (
              maintenance.map((record, index) => (
                <div key={index} className={styles.alertCard}>
                  <p>วันที่: {record.date ?? '-'}</p>
                  <p>เหตุผล: {record.reason ?? '-'}</p>
                  <p>หมายเหตุ: {record.note ?? '-'}</p>
                </div>
              ))
            )}
            <p className={styles.smallNote}>ข้อมูลประวัติการล้างถังเพื่อให้ประชาชนสามารถติดตามการบำรุงรักษาระบบประปาได้</p>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>แจ้งปัญหาการใช้งาน / ร้องเรียน</h2>
              <button className={styles.secondaryButton} type="button" onClick={() => setShowComplaintForm((prev) => !prev)}>
                {showComplaintForm ? 'ซ่อนแบบฟอร์ม' : 'กรอกแบบฟอร์มร้องเรียน'}
              </button>
            </div>
            {showComplaintForm && (
              <form id="complaint-form" onSubmit={handleSubmit} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>ชื่อ</label>
                  <input value={complaint.name} onChange={handleChange('name')} placeholder="เช่น นายสมชาย" />
                </div>
                <div className={styles.formField}>
                  <label>เบอร์โทร</label>
                  <input value={complaint.phone} onChange={handleChange('phone')} placeholder="080-123-4567" />
                </div>
                <div className={styles.formField}>
                  <label>หัวข้อ</label>
                  <input value={complaint.topic} onChange={handleChange('topic')} placeholder="เช่น น้ำขุ่น น้ำไม่ไหล" />
                </div>
                <div className={styles.formField}>
                  <label>รายละเอียด</label>
                  <textarea value={complaint.message} onChange={handleChange('message')} rows={5} placeholder="กรอกปัญหาที่พบ เช่น น้ำขุ่นมากไม่สามารถใช้งานได้" />
                </div>
                <button type="submit" className={styles.submitButton} disabled={complaintSaving}>
                  {complaintSaving ? 'กำลังส่ง...' : 'ส่งเรื่องร้องเรียน'}
                </button>
                {complaintMessage && <div className={styles.successMessage}>{complaintMessage}</div>}
              </form>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ข้อมูลผู้ดูแล</h2>
            </div>
            {admins.length === 0 ? (
              <p>ยังไม่มีข้อมูลผู้ดูแล</p>
            ) : (
              admins.map((admin, index) => (
                <div key={index} className={styles.alertCard}>
                  <p><strong>{admin.name}</strong></p>
                  <p>โทร: {admin.phone}</p>
                  <p>{admin.note}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
