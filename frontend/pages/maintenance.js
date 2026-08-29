import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [water, setWater] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newMaintenance, setNewMaintenance] = useState({ date: '', reason: '', note: '' });
  const [newPlan, setNewPlan] = useState({ scheduleDate: '', description: '', assignedTo: '' });
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newTurbidity, setNewTurbidity] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [report, setReport] = useState({ name: 'ผู้ดูแลระบบ', phone: '-', topic: 'รายงานปัญหาระบบ', message: '' });
  const [reportMsg, setReportMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [maintenanceJson, plansJson, complaintsJson, waterJson, alertJson, historyJson] = await Promise.all([
        fetch(`${apiBase}/api/maintenance`).then((r) => r.json()),
        fetch(`${apiBase}/api/plans`).then((r) => r.json()),
        fetch(`${apiBase}/api/complaints`).then((r) => r.json()),
        fetch(`${apiBase}/api/water`).then((r) => r.json()),
        fetch(`${apiBase}/api/alert`).then((r) => r.json()),
        fetch(`${apiBase}/api/history`).then((r) => r.json()),
      ]);
      setRecords(maintenanceJson);
      setPlans(plansJson);
      setComplaints(complaintsJson);
      setWater(waterJson);
      setAlerts(alertJson.alerts || []);
      setHistory(historyJson);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('auth_maintenance') || localStorage.getItem('auth_admin');
    if (!isAuth) {
      window.location.href = '/login?role=maintenance';
      return;
    }
    loadData();
  }, []);

  const handleMaintenanceChange = (field) => (e) => setNewMaintenance((p) => ({ ...p, [field]: e.target.value }));
  const handlePlanChange = (field) => (e) => setNewPlan((p) => ({ ...p, [field]: e.target.value }));

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch(`${apiBase}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaintenance),
    });
    if (res.ok) {
      setNewMaintenance({ date: '', reason: '', note: '' });
      setMessage('✅ เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว');
      setShowMaintenanceForm(false);
      await loadData();
    } else {
      setMessage('❌ ไม่สามารถบันทึกได้');
    }
    setSaving(false);
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch(`${apiBase}/api/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    });
    if (res.ok) {
      setNewPlan({ scheduleDate: '', description: '', assignedTo: '' });
      setMessage('✅ เพิ่มแผนงานเรียบร้อยแล้ว');
      setShowPlanForm(false);
      await loadData();
    } else {
      setMessage('❌ ไม่สามารถเพิ่มแผนงานได้');
    }
    setSaving(false);
  };

  const handleUpdateWater = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${apiBase}/api/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turbidity: Number(newTurbidity) }),
    });
    if (res.ok) {
      setMessage('✅ อัปเดตค่าความขุ่นเรียบร้อยแล้ว');
      setNewTurbidity('');
      await loadData();
    } else {
      setMessage('❌ ไม่สามารถอัปเดตค่าน้ำได้');
    }
    setSaving(false);
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    const res = await fetch(`${apiBase}/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage('✅ อัปเดตสถานะเรื่องร้องเรียนแล้ว');
      await loadData();
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${apiBase}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (res.ok) {
      setReportMsg('ส่งรายงานให้แอดมินเรียบร้อยแล้ว');
      setReport({ name: 'ผู้ดูแลระบบ', phone: '-', topic: 'รายงานปัญหาระบบ', message: '' });
      setShowReportForm(false);
    } else {
      setReportMsg('ส่งรายงานไม่สำเร็จ');
    }
    setSaving(false);
  };

  const statusColor = water?.status === 'Critical' ? '#dc2626' : water?.status === 'Alert' ? '#d97706' : '#16a34a';

  return (
    <Layout title="ผู้ดูแลระบบประปา" subtitle="ตรวจสอบคุณภาพน้ำ บันทึกการล้างถัง วางแผนงาน และจัดการเรื่องร้องเรียน">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
        <button className={styles.dangerButton} onClick={() => {
          setShowReportForm(true);
          setTimeout(() => document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}>
          รายงานปัญหาระบบให้แอดมิน
        </button>
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}
      {reportMsg && <div className={styles.successMessage}>{reportMsg}</div>}

      {/* Report to Admin Form */}
      {showReportForm && (
        <div className={styles.card} id="report-section" style={{ borderTop: '3px solid #dc2626' }}>
          <div className={styles.sectionTitle}>
            <h2>รายงานปัญหาระบบให้แอดมิน</h2>
            <button className={styles.secondaryButton} onClick={() => setShowReportForm(false)}>ปิด</button>
          </div>
          <form onSubmit={handleReport} className={styles.formColumn}>
            <div className={styles.formField}>
              <label>หัวข้อปัญหา</label>
              <input value={report.topic} onChange={e => setReport(p => ({ ...p, topic: e.target.value }))} required />
            </div>
            <div className={styles.formField}>
              <label>รายละเอียดปัญหาที่พบ</label>
              <textarea value={report.message} onChange={e => setReport(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="อธิบายปัญหาที่พบ เช่น เซ็นเซอร์ค่าผิดพลาด ปั๊มไม่ทำงาน..." required />
            </div>
            <div className={styles.buttonRow}>
              <button type="submit" className={styles.actionButton} disabled={saving}>
                {saving ? 'กำลังส่ง...' : 'ส่งรายงาน'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          {/* 1. สถานะน้ำ + อัปเดตค่าความขุ่น */}
          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>💧 สถานะคุณภาพน้ำ</h2>
                <span style={{ background: statusColor, color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>
                  {water?.level ?? '-'}
                </span>
              </div>
              <p>ความขุ่น: <strong>{water?.turbidity ?? '-'} NTU</strong></p>
              <p>สถานะ: <strong>{water?.message ?? '-'}</strong></p>
              <p>อัปเดตล่าสุด: {water?.timestamp ? new Date(water.timestamp).toLocaleString('th-TH') : '-'}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>📊 อัปเดตค่าความขุ่นน้ำ</h2>
              </div>
              <form onSubmit={handleUpdateWater} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>ค่าความขุ่น (NTU)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTurbidity}
                    onChange={(e) => setNewTurbidity(e.target.value)}
                    placeholder="เช่น 2.5"
                    required
                  />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกค่าน้ำ'}
                </button>
              </form>
            </div>
          </div>

          {/* 2. การแจ้งเตือน */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>🔔 การแจ้งเตือน</h2>
            </div>
            <div className={styles.gridTwo}>
              {alerts.map((alert, i) => (
                <div key={i} className={styles.alertCard} style={{ borderLeft: `4px solid ${alert.active ? '#e74c3c' : '#27ae60'}` }}>
                  <p><strong>{alert.type}</strong></p>
                  <p>{alert.message}</p>
                  <p style={{ color: alert.active ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                    {alert.active ? '⚠️ ต้องตรวจสอบ' : '✅ ปกติ'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. บันทึกการล้างถัง */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>🪣 บันทึกการล้างถัง</h2>
              <button className={styles.secondaryButton} onClick={() => setShowMaintenanceForm((p) => !p)}>
                {showMaintenanceForm ? 'ซ่อนฟอร์ม' : '+ เพิ่มบันทึก'}
              </button>
            </div>
            {showMaintenanceForm && (
              <form onSubmit={handleAddMaintenance} className={styles.formColumn} style={{ marginBottom: '1rem' }}>
                <div className={styles.formField}>
                  <label>วันที่ล้างถัง</label>
                  <input type="date" value={newMaintenance.date} onChange={handleMaintenanceChange('date')} required />
                </div>
                <div className={styles.formField}>
                  <label>เหตุผล</label>
                  <input value={newMaintenance.reason} onChange={handleMaintenanceChange('reason')} placeholder="เช่น ล้างถังตามกำหนด" required />
                </div>
                <div className={styles.formField}>
                  <label>หมายเหตุ</label>
                  <textarea value={newMaintenance.note} onChange={handleMaintenanceChange('note')} rows={3} placeholder="รายละเอียดเพิ่มเติม" />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </form>
            )}
            <div className={styles.gridTwo}>
              {records.length === 0 ? (
                <p>ยังไม่มีบันทึกการล้างถัง</p>
              ) : (
                records.map((r, i) => (
                  <div key={i} className={styles.alertCard}>
                    <p>📅 วันที่: <strong>{r.date}</strong></p>
                    <p>เหตุผล: {r.reason}</p>
                    <p>หมายเหตุ: {r.note || '-'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. แผนการล้างถัง */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>📋 แผนการบำรุงรักษา</h2>
              <button className={styles.secondaryButton} onClick={() => setShowPlanForm((p) => !p)}>
                {showPlanForm ? 'ซ่อนฟอร์ม' : '+ วางแผนใหม่'}
              </button>
            </div>
            {showPlanForm && (
              <form onSubmit={handleAddPlan} className={styles.formColumn} style={{ marginBottom: '1rem' }}>
                <div className={styles.formField}>
                  <label>วันที่กำหนด</label>
                  <input type="date" value={newPlan.scheduleDate} onChange={handlePlanChange('scheduleDate')} required />
                </div>
                <div className={styles.formField}>
                  <label>รายละเอียดงาน</label>
                  <input value={newPlan.description} onChange={handlePlanChange('description')} placeholder="เช่น ตรวจสอบถังหลัก" required />
                </div>
                <div className={styles.formField}>
                  <label>ผู้รับผิดชอบ</label>
                  <input value={newPlan.assignedTo} onChange={handlePlanChange('assignedTo')} placeholder="เช่น นายสมชาย" required />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}
                </button>
              </form>
            )}
            <div className={styles.gridTwo}>
              {plans.length === 0 ? (
                <p>ยังไม่มีแผนการบำรุงรักษา</p>
              ) : (
                plans.map((p, i) => (
                  <div key={i} className={styles.alertCard}>
                    <p>📅 วันที่: <strong>{p.scheduleDate}</strong></p>
                    <p>งาน: {p.description}</p>
                    <p>ผู้รับผิดชอบ: {p.assignedTo}</p>
                    <p>สถานะ: <span style={{ color: p.status === 'Done' ? '#27ae60' : '#f39c12', fontWeight: 'bold' }}>{p.status}</span></p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. เรื่องร้องเรียนจากชาวบ้าน */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>📣 เรื่องร้องเรียนจากชาวบ้าน</h2>
              <span style={{ background: complaints.filter(c => c.status === 'Open').length > 0 ? '#e74c3c' : '#27ae60', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>
                รอดำเนินการ: {complaints.filter(c => c.status === 'Open').length} รายการ
              </span>
            </div>
            {complaints.length === 0 ? (
              <p>ยังไม่มีเรื่องร้องเรียน</p>
            ) : (
              <div className={styles.gridTwo}>
                {complaints.map((item) => (
                  <div key={item._id || item.id} className={styles.alertCard} style={{ borderLeft: `4px solid ${item.status === 'Open' ? '#e74c3c' : '#27ae60'}` }}>
                    <p><strong>{item.topic}</strong></p>
                    <p>ชื่อ: {item.name} | โทร: {item.phone}</p>
                    <p>{item.message}</p>
                    <p>วันที่: {new Date(item.submittedAt).toLocaleString('th-TH')}</p>
                    <p style={{ color: item.status === 'Open' ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                      สถานะ: {item.status === 'Open' ? '🔴 รอดำเนินการ' : '🟢 ดำเนินการแล้ว'}
                    </p>
                    {item.status === 'Open' && (
                      <button
                        className={styles.smallButton}
                        onClick={() => handleUpdateComplaintStatus(item._id || item.id, 'Resolved')}
                      >
                        ✓ ดำเนินการแล้ว
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. ประวัติการบำรุงรักษา */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>📜 ประวัติการบำรุงรักษา</h2>
            </div>
            {history.length === 0 ? (
              <p>ยังไม่มีประวัติ</p>
            ) : (
              <div className={styles.gridTwo}>
                {history.map((item, i) => (
                  <div key={i} className={styles.alertCard}>
                    <p>📅 วันที่: <strong>{item.date}</strong></p>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
