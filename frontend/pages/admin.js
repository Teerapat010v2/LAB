import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function AdminPage() {
  const [water, setWater] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [plans, setPlans] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [history, setHistory] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', note: '' });
  const [newMaintenance, setNewMaintenance] = useState({ date: '', reason: '', note: '' });
  const [newPlan, setNewPlan] = useState({ scheduleDate: '', description: '', assignedTo: '' });
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [waterJson, maintenanceJson, adminsJson, plansJson, complaintsJson, historyJson] = await Promise.all([
      fetch(`${apiBase}/api/water`).then((res) => res.json()),
      fetch(`${apiBase}/api/maintenance`).then((res) => res.json()),
      fetch(`${apiBase}/api/admins`).then((res) => res.json()),
      fetch(`${apiBase}/api/plans`).then((res) => res.json()),
      fetch(`${apiBase}/api/complaints`).then((res) => res.json()),
      fetch(`${apiBase}/api/history`).then((res) => res.json()),
    ]);
    setWater(waterJson);
    setMaintenance(maintenanceJson);
    setAdmins(adminsJson);
    setPlans(plansJson);
    setComplaints(complaintsJson);
    setHistory(historyJson);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewAdminChange = (field) => (event) => {
    setNewAdmin((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleNewMaintenanceChange = (field) => (event) => {
    setNewMaintenance((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleNewPlanChange = (field) => (event) => {
    setNewPlan((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const response = await fetch(`${apiBase}/api/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin),
    });

    if (response.ok) {
      const data = await response.json();
      setAdmins(data.admins || []);
      setNewAdmin({ name: '', phone: '', note: '' });
      setMessage('เพิ่มผู้ดูแลใหม่เรียบร้อยแล้ว');
    } else {
      setMessage('ไม่สามารถเพิ่มผู้ดูแลได้');
    }

    setSaving(false);
  };

  const handleAddMaintenance = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const response = await fetch(`${apiBase}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaintenance),
    });

    if (response.ok) {
      setNewMaintenance({ date: '', reason: '', note: '' });
      setMessage('เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว');
      await loadData();
    } else {
      setMessage('ไม่สามารถเพิ่มบันทึกได้');
    }

    setSaving(false);
  };

  const handleAddPlan = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const response = await fetch(`${apiBase}/api/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    });

    if (response.ok) {
      setNewPlan({ scheduleDate: '', description: '', assignedTo: '' });
      setMessage('เพิ่มแผนการล้างถังเรียบร้อยแล้ว');
      await loadData();
    } else {
      setMessage('ไม่สามารถเพิ่มแผนได้');
    }

    setSaving(false);
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    const response = await fetch(`${apiBase}/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      await loadData();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>แดชบอร์ดผู้ดูแล</h1>
          <p className={styles.pageIntro}>จัดการข้อมูลน้ำ ประวัติการล้างถัง แผนงาน และเรื่องร้องเรียนทั้งหมดในที่เดียว</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} type="button" onClick={loadData}>
            รีเฟรชข้อมูล
          </button>
          <Link href="/user" className={styles.secondaryButton}>
            หน้าใช้งานประชาชน
          </Link>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>Water Status</h2>
                <Link href="/water" className={styles.linkButton}>
                  สถานะน้ำ
                </Link>
              </div>
              <p>ความขุ่น: <strong>{water?.turbidity ?? '-'}</strong> NTU</p>
              <p>ระดับ: <strong>{water?.level ?? '-'}</strong></p>
              <p>ข้อความ: {water?.message ?? '-'}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <h2>บันทึกการล้างถัง</h2>
                <Link href="/maintenance" className={styles.linkButton}>
                  ดูบันทึกทั้งหมด
                </Link>
              </div>
              {maintenance.length === 0 ? (
                <p>ยังไม่มีบันทึกการบำรุงรักษา</p>
              ) : (
                maintenance.map((record) => (
                  <div key={record.id || record.date} className={styles.alertCard}>
                    <p>วันที่: {record.date ?? '-'}</p>
                    <p>เหตุผล: {record.reason ?? '-'}</p>
                    <p>หมายเหตุ: {record.note ?? '-'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>เพิ่มบันทึกการล้างถัง</h2>
              <button className={styles.secondaryButton} type="button" onClick={() => setShowMaintenanceForm((prev) => !prev)}>
                {showMaintenanceForm ? 'ซ่อนฟอร์ม' : 'แสดงฟอร์มล้างถัง'}
              </button>
            </div>
            {showMaintenanceForm && (
              <form onSubmit={handleAddMaintenance} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>วันที่</label>
                  <input type="date" value={newMaintenance.date} onChange={handleNewMaintenanceChange('date')} />
                </div>
                <div className={styles.formField}>
                  <label>เหตุผล</label>
                  <input value={newMaintenance.reason} onChange={handleNewMaintenanceChange('reason')} placeholder="เช่น ล้างถังตามกำหนด" />
                </div>
                <div className={styles.formField}>
                  <label>หมายเหตุ</label>
                  <textarea value={newMaintenance.note} onChange={handleNewMaintenanceChange('note')} rows={4} placeholder="หมายเหตุเพิ่มเติม" />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการล้างถัง'}
                </button>
              </form>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>แผนการล้างถัง</h2>
              <button className={styles.secondaryButton} type="button" onClick={() => document.getElementById('plan-form')?.scrollIntoView({ behavior: 'smooth' })}>
                สร้างแผนใหม่
              </button>
            </div>
            {plans.length === 0 ? (
              <p>ยังไม่มีแผนการล้างถัง</p>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className={styles.alertCard}>
                  <p>วันที่: {plan.scheduleDate}</p>
                  <p>รายละเอียด: {plan.description}</p>
                  <p>ผู้รับผิดชอบ: {plan.assignedTo}</p>
                  <p>สถานะ: {plan.status}</p>
                </div>
              ))
            )}
            <button className={styles.secondaryButton} type="button" onClick={() => setShowPlanForm((prev) => !prev)}>
              {showPlanForm ? 'ซ่อนฟอร์มสร้างแผน' : 'สร้างแผนการล้างถัง'}
            </button>
            {showPlanForm && (
              <form onSubmit={handleAddPlan} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>วันที่กำหนด</label>
                  <input type="date" value={newPlan.scheduleDate} onChange={handleNewPlanChange('scheduleDate')} />
                </div>
                <div className={styles.formField}>
                  <label>คำอธิบาย</label>
                  <input value={newPlan.description} onChange={handleNewPlanChange('description')} placeholder="เช่น ตรวจสอบถังหลัก" />
                </div>
                <div className={styles.formField}>
                  <label>ผู้รับผิดชอบ</label>
                  <input value={newPlan.assignedTo} onChange={handleNewPlanChange('assignedTo')} placeholder="เช่น ทีมช่างประปา" />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกแผนการล้างถัง'}
                </button>
              </form>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>เรื่องร้องเรียน</h2>
              <Link href="/user" className={styles.linkButton}>
                ดูหน้าผู้ใช้
              </Link>
            </div>
            {complaints.length === 0 ? (
              <p>ยังไม่มีเรื่องร้องเรียน</p>
            ) : (
              complaints.map((item) => (
                <div key={item.id} className={styles.alertCard}>
                  <p><strong>{item.topic}</strong> ({item.status})</p>
                  <p>ผู้ร้องเรียน: {item.name}</p>
                  <p>โทร: {item.phone}</p>
                  <p>{item.message}</p>
                  <p>วันที่ส่ง: {new Date(item.submittedAt).toLocaleString()}</p>
                  {item.status !== 'Resolved' && (
                    <button className={styles.smallButton} onClick={() => handleUpdateComplaintStatus(item.id, 'Resolved')}>
                      ดำเนินการแล้ว
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ประวัติการล้างถัง</h2>
            </div>
            {history.length === 0 ? (
              <p>ยังไม่มีประวัติ</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className={styles.alertCard}>
                  <p>วันที่: {item.date}</p>
                  <p>รายละเอียด: {item.note}</p>
                </div>
              ))
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ผู้ดูแลระบบ</h2>
            </div>
            {admins.length === 0 ? (
              <p>ยังไม่มีผู้ดูแล</p>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className={styles.alertCard}>
                  <p><strong>{admin.name}</strong></p>
                  <p>โทร: {admin.phone}</p>
                  <p>{admin.note}</p>
                </div>
              ))
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>เพิ่มผู้ดูแลใหม่</h2>
              <button className={styles.secondaryButton} type="button" onClick={() => setShowAdminForm((prev) => !prev)}>
                {showAdminForm ? 'ซ่อนฟอร์ม' : 'แสดงฟอร์มเพิ่มผู้ดูแล'}
              </button>
            </div>
            {showAdminForm && (
              <form onSubmit={handleAddAdmin} className={styles.formColumn}>
                <div className={styles.formField}>
                  <label>ชื่อผู้ดูแล</label>
                  <input value={newAdmin.name} onChange={handleNewAdminChange('name')} />
                </div>
                <div className={styles.formField}>
                  <label>เบอร์โทร</label>
                  <input value={newAdmin.phone} onChange={handleNewAdminChange('phone')} />
                </div>
                <div className={styles.formField}>
                  <label>หมายเหตุ</label>
                  <textarea value={newAdmin.note} onChange={handleNewAdminChange('note')} rows={4} />
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ดูแล'}
                </button>
                {message && <div className={styles.successMessage}>{message}</div>}
              </form>
            )}
          </div>
        </>
      )}

    </div>
  );
}
