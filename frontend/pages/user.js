import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function UserPage() {
  const [water, setWater] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState({ name: '', phone: '', topic: '', message: '' });
  const [complaintMsg, setComplaintMsg] = useState('');
  const [complaintSaving, setComplaintSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [w, al, adm, mnt] = await Promise.all([
        fetch(`${apiBase}/api/water`).then(r => r.json()).catch(() => null),
        fetch(`${apiBase}/api/alert`).then(r => r.json()).catch(() => ({ alerts: [] })),
        fetch(`${apiBase}/api/admins`).then(r => r.json()).catch(() => []),
        fetch(`${apiBase}/api/maintenance`).then(r => r.json()).catch(() => []),
      ]);
      setWater(w);
      setAlerts(al.alerts || []);
      setAdmins(adm || []);
      setMaintenance((mnt || []).slice(0, 3));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setComplaintSaving(true);
    setComplaintMsg('');
    try {
      const r = await fetch(`${apiBase}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint),
      });
      if (r.ok) {
        setComplaint({ name: '', phone: '', topic: '', message: '' });
        setComplaintMsg('ส่งเรื่องร้องเรียนเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็ว');
        setShowForm(false);
      } else {
        setComplaintMsg('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } catch { setComplaintMsg('ไม่สามารถเชื่อมต่อระบบได้'); }
    setComplaintSaving(false);
  };

  const wColor = water?.status === 'Critical' ? '#dc2626' : water?.status === 'Alert' ? '#d97706' : '#16a34a';

  return (
    <Layout title="บริการประชาชน" subtitle="ตรวจสอบคุณภาพน้ำ แจ้งเรื่องร้องเรียน และติดตามประวัติการบำรุงรักษา">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/history" className={styles.secondaryButton}>ประวัติการบำรุงรักษา</Link>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p> : (
        <>
          {/* Water Status + Alerts */}
          <div className={styles.gridTwo}>
            <div className={styles.card} style={{ borderTop: `3px solid ${wColor}` }}>
              <div className={styles.sectionTitle}>
                <h2>สถานะคุณภาพน้ำ</h2>
                <span className={styles.statusBadge} style={{ background: wColor + '1a', color: wColor }}>
                  {water?.level ?? '-'}
                </span>
              </div>
              <p>ความขุ่น: <strong style={{ color: wColor }}>{water?.turbidity ?? '-'} NTU</strong></p>
              <p>{water?.message ?? 'ไม่สามารถโหลดข้อมูลได้'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                อัปเดต: {water?.timestamp ? new Date(water.timestamp).toLocaleString('th-TH') : '-'}
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionTitle}><h2>การแจ้งเตือน</h2></div>
              {alerts.length === 0 ? (
                <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
              ) : alerts.map((al, i) => (
                <div key={i} className={styles.alertCard} style={{ borderLeft: `3px solid ${al.active ? '#dc2626' : '#16a34a'}` }}>
                  <p><strong>{al.type}</strong></p>
                  <p>{al.message}</p>
                  <p className={al.active ? styles.statusActive : styles.statusNormal}>
                    {al.active ? 'ต้องตรวจสอบ' : 'ปกติ'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance summary */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ประวัติการบำรุงรักษาล่าสุด</h2>
              <Link href="/maintenance-logs" className={styles.linkButton}>ดูแบบตารางทั้งหมด</Link>
            </div>
            {maintenance.length === 0 ? (
              <p>ยังไม่มีบันทึกการบำรุงรักษา</p>
            ) : maintenance.map((r, i) => (
              <div key={i} className={styles.alertCard}>
                <p><strong>วันที่ {r.date}</strong> — {r.reason}</p>
                {r.note && <p>{r.note}</p>}
              </div>
            ))}
          </div>

          {/* Complaint */}
          <div className={styles.card} id="complaint-section">
            <div className={styles.sectionTitle}><h2>แจ้งปัญหาการใช้น้ำ / ร้องเรียน</h2></div>
            <div className={styles.buttonRow}>
              <button className={styles.secondaryButton} onClick={() => { setShowForm(true); setComplaint(p => ({ ...p, topic: '' })); }}>
                กรอกแบบฟอร์มร้องเรียน
              </button>
              <button className={styles.dangerButton} onClick={() => { setShowForm(true); setComplaint(p => ({ ...p, topic: 'รายงานระบบทำงานผิดพลาด' })); }}>
                แจ้งระบบขัดข้อง
              </button>
            </div>

            {complaintMsg && <div className={styles.successMessage}>{complaintMsg}</div>}

            {showForm && (
              <form onSubmit={handleSubmit} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>ชื่อ</label>
                  <input value={complaint.name} onChange={e => setComplaint(p => ({ ...p, name: e.target.value }))} placeholder="เช่น นายสมชาย ใจดี" />
                </div>
                <div className={styles.formField}>
                  <label>เบอร์โทรศัพท์</label>
                  <input value={complaint.phone} onChange={e => setComplaint(p => ({ ...p, phone: e.target.value }))} placeholder="080-123-4567" />
                </div>
                <div className={styles.formField}>
                  <label>หัวข้อ</label>
                  <input value={complaint.topic} onChange={e => setComplaint(p => ({ ...p, topic: e.target.value }))} placeholder="เช่น น้ำขุ่น น้ำไม่ไหล" />
                </div>
                <div className={styles.formField}>
                  <label>รายละเอียด</label>
                  <textarea value={complaint.message} onChange={e => setComplaint(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="อธิบายปัญหาที่พบ..." />
                </div>
                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.actionButton} disabled={complaintSaving}>
                    {complaintSaving ? 'กำลังส่ง...' : 'ส่งเรื่องร้องเรียน'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={() => setShowForm(false)}>ยกเลิก</button>
                </div>
              </form>
            )}
          </div>

          {/* Admin contact */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}><h2>ข้อมูลผู้ดูแลระบบ</h2></div>
            {admins.length === 0 ? (
              <p>ยังไม่มีข้อมูลผู้ดูแล</p>
            ) : admins.map((a, i) => (
              <div key={i} className={styles.alertCard}>
                <p><strong>{a.name}</strong></p>
                <p>โทรศัพท์: {a.phone}</p>
                {a.note && <p>{a.note}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
