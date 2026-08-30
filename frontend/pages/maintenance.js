import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';

registerLocale('th', th);

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

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
  const [newMaintenance, setNewMaintenance] = useState({ date: '', reason: '', note: '', worker: '' });
  const [newPlan, setNewPlan] = useState({ scheduleDate: '', description: '', assignedTo: '', routineInterval: '' });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newTurbidity, setNewTurbidity] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [report, setReport] = useState({ name: 'ผู้ดูแลระบบ', phone: '-', topic: 'รายงานปัญหาระบบ', message: '' });
  const [reportMsg, setReportMsg] = useState('');
  const [admins, setAdmins] = useState([]);
  const loadData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/dashboard`);
      const data = await r.json();
      setRecords(data.maintenance || []);
      setPlans(data.plans || []);
      setComplaints(data.complaints || []);
      setWater(data.water || null);
      setAlerts(data.alerts || []);
      setHistory(data.history || []);
      setAdmins(data.admins || []);
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
      setNewMaintenance({ date: '', reason: '', note: '', worker: '' });
      setMessage(' เพิ่มบันทึกการทำงานเรียบร้อยแล้ว');
      setShowMaintenanceForm(false);
      await loadData();
    } else {
      setMessage(' ไม่สามารถบันทึกได้');
    }
    setSaving(false);
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const url = editingPlanId ? `${apiBase}/api/plans/${editingPlanId}` : `${apiBase}/api/plans`;
    const method = editingPlanId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    });
    if (res.ok) {
      setNewPlan({ scheduleDate: '', description: '', assignedTo: '', routineInterval: '' });
      setEditingPlanId(null);
      setMessage(editingPlanId ? ' แก้ไขแผนงานเรียบร้อยแล้ว' : ' เพิ่มแผนงานเรียบร้อยแล้ว');
      setShowPlanForm(false);
      await loadData();
    } else {
      setMessage(' ไม่สามารถบันทึกแผนงานได้');
    }
    setSaving(false);
  };

  const handleEditPlanClick = (plan) => {
    setNewPlan({ 
      scheduleDate: plan.scheduleDate || '', 
      description: plan.description || '', 
      assignedTo: plan.assignedTo || '', 
      routineInterval: plan.routineInterval || '' 
    });
    setEditingPlanId(plan._id);
    setShowPlanForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนงานนี้?')) return;
    try {
      const res = await fetch(`${apiBase}/api/plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      } else {
        alert('เกิดข้อผิดพลาดในการลบแผนงาน');
      }
    } catch (err) {
      console.error(err);
    }
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
      setMessage(' อัปเดตค่าความขุ่นเรียบร้อยแล้ว');
      setNewTurbidity('');
      await loadData();
    } else {
      setMessage(' ไม่สามารถอัปเดตค่าน้ำได้');
    }
    setSaving(false);
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage('อัปเดตสถานะเรื่องร้องเรียนแล้ว');
        setTimeout(() => setMessage(''), 3000);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlanStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage('อัปเดตสถานะแผนงานแล้ว');
        setTimeout(() => setMessage(''), 3000);
        await loadData();
      }
    } catch (err) {
      console.error(err);
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
    <Layout title="ผู้ดูแลระบบประปา" subtitle="ตรวจสอบคุณภาพน้ำ บันทึกการทำงาน วางแผนงาน และจัดการเรื่องร้องเรียน">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          {/* 1. สถานะน้ำ + อัปเดตค่าความขุ่น */}
          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2> สถานะคุณภาพน้ำ</h2>
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
                <h2> อัปเดตค่าความขุ่นน้ำ</h2>
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
              <h2>การแจ้งเตือน</h2>
            </div>
            <div className={styles.gridTwo}>
              {alerts.map((alert, i) => {
                const linkTo = alert.type === 'ร้องเรียน' ? '/complaints' : null;
                const cardContent = (
                  <div className={styles.alertCard} style={{ borderLeft: `4px solid ${alert.active ? '#e74c3c' : '#27ae60'}`, cursor: linkTo ? 'pointer' : 'default' }}>
                    <p><strong>{alert.type}</strong></p>
                    <p>{alert.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: alert.active ? '#e74c3c' : '#27ae60', fontWeight: 'bold', margin: 0 }}>
                        {alert.active ? '️ ต้องตรวจสอบ' : ' ปกติ'}
                      </p>
                      {linkTo && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline' }}>กดเพื่อไปตรวจสอบ &rarr;</span>}
                    </div>
                  </div>
                );
                
                return linkTo ? (
                  <Link href={linkTo} key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {cardContent}
                  </Link>
                ) : (
                  <div key={i}>{cardContent}</div>
                );
              })}
            </div>
          </div>

          {/* 3. บันทึกการทำงาน */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>บันทึกการทำงาน</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={styles.secondaryButton} onClick={() => setShowMaintenanceForm((p) => !p)}>
                  {showMaintenanceForm ? 'ซ่อนฟอร์ม' : '+ เพิ่มบันทึก'}
                </button>
              </div>
            </div>
            {showMaintenanceForm && (
              <form onSubmit={handleAddMaintenance} className={styles.formColumn} style={{ marginBottom: '1rem' }}>
                <div className={styles.formField}>
                  <label>วันที่ทำงาน</label>
                  <DatePicker 
                    selected={newMaintenance.date ? new Date(newMaintenance.date) : null}
                    onChange={(date) => setNewMaintenance(p => ({ ...p, date: date ? date.toISOString().split('T')[0] : '' }))}
                    locale="th"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="วว/ดด/ปปปป"
                    className={styles.datePickerInput}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>ผู้ดำเนินการ</label>
                  <select value={newMaintenance.worker} onChange={handleMaintenanceChange('worker')} required>
                    <option value="">-- เลือกผู้ดำเนินการ --</option>
                    {admins.map(a => (
                      <option key={a._id} value={a.name}>{a.name}</option>
                    ))}
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
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
                <p>ยังไม่มีบันทึกการทำงาน</p>
              ) : (
                records.slice(0, 4).map((r, i) => (
                  <div key={i} className={styles.alertCard}>
                    <p>วันที่: <strong>{r.date ? new Date(r.date).toLocaleDateString('th-TH') : '-'}</strong></p>
                    <p>เหตุผล: {r.reason}</p>
                    <p>หมายเหตุ: {r.note || '-'}</p>
                  </div>
                ))
              )}
            </div>
            {records.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/maintenance-logs" className={styles.secondaryButton} style={{ width: '100%' }}>
                  ดูทั้งหมด (มีอีก {records.length - 4} รายการ)
                </Link>
              </div>
            )}
          </div>

          {/* 4. แผนการล้างถัง */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>แผนการบำรุงรักษา</h2>
              <button className={styles.secondaryButton} onClick={() => setShowPlanForm((p) => !p)}>
                {showPlanForm ? 'ซ่อนฟอร์ม' : '+ วางแผนล่วงหน้า'}
              </button>
            </div>
            
            {showPlanForm && (
              <form onSubmit={handleAddPlan} className={styles.formColumn} style={{ marginBottom: '1rem' }}>
                <div className={styles.formField}>
                  <label>วันที่เริ่มกำหนด</label>
                  <DatePicker 
                    selected={newPlan.scheduleDate ? new Date(newPlan.scheduleDate) : null}
                    onChange={(date) => setNewPlan(p => ({ ...p, scheduleDate: date ? date.toISOString().split('T')[0] : '' }))}
                    locale="th"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="วว/ดด/ปปปป"
                    className={styles.datePickerInput}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>รายละเอียดงาน</label>
                  <input value={newPlan.description} onChange={handlePlanChange('description')} placeholder="เช่น ล้างถัง, เติมคลอรีน" required />
                </div>
                <div className={styles.formField}>
                  <label>ผู้รับผิดชอบ</label>
                  <input value={newPlan.assignedTo} onChange={handlePlanChange('assignedTo')} placeholder="เช่น นายสมชาย" required />
                </div>
                <div className={styles.formField}>
                  <label>ทำซ้ำทุกๆ (วัน)</label>
                  <input type="number" value={newPlan.routineInterval} onChange={handlePlanChange('routineInterval')} placeholder="เว้นว่างไว้หากไม่ต้องการทำซ้ำอัตโนมัติ" />
                  <small style={{ color: 'var(--text-muted)' }}>* เช่น 90 วัน, 30 วัน ระบบจะสร้างงานรอบใหม่เมื่อกดเสร็จสิ้น</small>
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
                plans.slice(0, 4).map((p, i) => (
                  <div key={p._id || i} className={styles.alertCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p>วันที่: <strong>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</strong></p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={styles.smallButton} style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)', margin: 0 }} onClick={() => handleEditPlanClick(p)}>แก้ไข</button>
                        <button className={styles.smallButton} style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', margin: 0 }} onClick={() => handleDeletePlan(p._id)}>ลบ</button>
                      </div>
                    </div>
                    <p>งาน: {p.description}</p>
                    <p>ผู้รับผิดชอบ: {p.assignedTo}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <p style={{ margin: 0 }}>สถานะ: <span style={{ color: p.status === 'เสร็จสิ้น' ? 'var(--success)' : 'var(--primary)', fontWeight: 'bold' }}>{p.status}</span></p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {p.status === 'ตามแผน' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdatePlanStatus(p._id, 'กำลังดำเนินการ')}>กำลังดำเนินการ</button>
                        )}
                        {p.status === 'กำลังดำเนินการ' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdatePlanStatus(p._id, 'เสร็จสิ้น')}>เสร็จสิ้น</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {plans.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/plans" className={styles.secondaryButton} style={{ width: '100%' }}>
                  ดูทั้งหมด (มีอีก {plans.length - 4} รายการ)
                </Link>
              </div>
            )}
          </div>

          {/* 5. เรื่องร้องเรียนจากชาวบ้าน */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2>เรื่องร้องเรียนจากชาวบ้าน</h2>
                <span className={styles.statusBadge} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  ค้างดำเนินการ: {complaints.filter(c => c.status !== 'เสร็จงาน').length}
                </span>
              </div>
            </div>
            {complaints.length === 0 ? (
              <p>ยังไม่มีเรื่องร้องเรียน</p>
            ) : (
              <div className={styles.gridTwo}>
                {complaints.slice(0, 4).map((item) => (
                  <div key={item._id || item.id} className={styles.alertCard}>
                    <p><strong>{item.topic}</strong></p>
                    <p>ชื่อ: {item.name} | โทร: {item.phone}</p>
                    <p>{item.message}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>วันที่: {new Date(item.submittedAt).toLocaleString('th-TH')}</p>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      สถานะ: {item.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {complaints.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/complaints" className={styles.secondaryButton} style={{ width: '100%' }}>
                  ดูทั้งหมด (มีอีก {complaints.length - 4} รายการ)
                </Link>
              </div>
            )}
          </div>

          {/* 6. ประวัติการบำรุงรักษา */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ประวัติการบำรุงรักษา</h2>
            </div>
            {history.length === 0 ? (
              <p>ยังไม่มีประวัติ</p>
            ) : (
              <div className={styles.gridTwo}>
                {history.slice(0, 4).map((item, i) => (
                  <div key={i} className={styles.alertCard}>
                    <p>วันที่: <strong>{item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</strong></p>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            )}
            {history.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/history" className={styles.secondaryButton} style={{ width: '100%' }}>
                  ดูทั้งหมด (มีอีก {history.length - 4} รายการ)
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
