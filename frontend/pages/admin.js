import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// ---- Helper ----
const Section = ({ icon, title, children, badge, badgeColor = '#e74c3c' }) => (
  <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
    <div className={styles.sectionTitle}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon} {title}
      </h2>
      {badge !== undefined && (
        <span style={{ background: badgeColor, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.82rem' }}>
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className={styles.formField}>
    <label>{label}</label>
    {children}
  </div>
);

export default function AdminPage() {
  // --- state ---
  const [water, setWater] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [contact, setContact] = useState({ name: '', phone: '', note: '' });
  const [admins, setAdmins] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [plans, setPlans] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // form states
  const [turbidity, setTurbidity] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', note: '' });
  const [newMaintenance, setNewMaintenance] = useState({ date: '', reason: '', note: '' });
  const [newPlan, setNewPlan] = useState({ scheduleDate: '', description: '', assignedTo: '' });
  const [editContact, setEditContact] = useState({ name: '', phone: '', note: '' });

  // panel toggles
  const [panels, setPanels] = useState({
    iot: false, wifi: false, db: false,
    addAdmin: false, addMaintenance: false, addPlan: false, editContact: false,
  });
  const toggle = (key) => setPanels((p) => ({ ...p, [key]: !p[key] }));

  // api status
  const [apiStatus, setApiStatus] = useState({});

  const loadData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [w, al, co, adm, mnt, pl, cmp, hst] = await Promise.all([
        fetch(`${apiBase}/api/water`).then((r) => r.json()).catch(() => null),
        fetch(`${apiBase}/api/alert`).then((r) => r.json()).catch(() => ({ alerts: [] })),
        fetch(`${apiBase}/api/contact`).then((r) => r.json()).catch(() => ({})),
        fetch(`${apiBase}/api/admins`).then((r) => r.json()).catch(() => []),
        fetch(`${apiBase}/api/maintenance`).then((r) => r.json()).catch(() => []),
        fetch(`${apiBase}/api/plans`).then((r) => r.json()).catch(() => []),
        fetch(`${apiBase}/api/complaints`).then((r) => r.json()).catch(() => []),
        fetch(`${apiBase}/api/history`).then((r) => r.json()).catch(() => []),
      ]);
      setWater(w);
      setAlerts(al.alerts || []);
      setContact(co);
      setEditContact({ name: co.name || '', phone: co.phone || '', note: co.note || '' });
      setAdmins(adm);
      setMaintenance(mnt);
      setPlans(pl);
      setComplaints(cmp);
      setHistory(hst);

      // check API endpoints
      const endpoints = ['water', 'alert', 'contact', 'admins', 'maintenance', 'plans', 'complaints', 'history'];
      const statuses = {};
      await Promise.all(endpoints.map(async (ep) => {
        try {
          const r = await fetch(`${apiBase}/api/${ep}`);
          statuses[ep] = r.ok ? 'OK' : 'ERROR';
        } catch {
          statuses[ep] = 'OFFLINE';
        }
      }));
      setApiStatus(statuses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('auth_admin');
    if (!isAuth) {
      window.location.href = '/login?role=admin';
      return;
    }
    loadData();
  }, []);

  const notify = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  };

  // ---- handlers ----
  const handleUpdateWater = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/water`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turbidity: Number(turbidity) }),
    });
    if (r.ok) { notify('✅ อัปเดตค่าน้ำแล้ว'); setTurbidity(''); await loadData(); }
    else notify('❌ ไม่สามารถอัปเดตค่าน้ำได้');
    setSaving(false);
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editContact),
    });
    if (r.ok) { notify('✅ บันทึกข้อมูลติดต่อแล้ว'); toggle('editContact'); await loadData(); }
    else notify('❌ บันทึกไม่สำเร็จ');
    setSaving(false);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/admins`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin),
    });
    if (r.ok) { notify('✅ เพิ่มผู้ดูแลแล้ว'); setNewAdmin({ name: '', phone: '', note: '' }); toggle('addAdmin'); await loadData(); }
    else notify('❌ เพิ่มผู้ดูแลไม่สำเร็จ');
    setSaving(false);
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/maintenance`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaintenance),
    });
    if (r.ok) { notify('✅ บันทึกการล้างถังแล้ว'); setNewMaintenance({ date: '', reason: '', note: '' }); toggle('addMaintenance'); await loadData(); }
    else notify('❌ บันทึกไม่สำเร็จ');
    setSaving(false);
  };

  const handleAddPlan = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/plans`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    });
    if (r.ok) { notify('✅ เพิ่มแผนงานแล้ว'); setNewPlan({ scheduleDate: '', description: '', assignedTo: '' }); toggle('addPlan'); await loadData(); }
    else notify('❌ เพิ่มแผนงานไม่สำเร็จ');
    setSaving(false);
  };

  const handleResolveComplaint = async (id) => {
    const r = await fetch(`${apiBase}/api/complaints/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    if (r.ok) { notify('✅ ปิดเรื่องร้องเรียนแล้ว'); await loadData(); }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_admin');
    window.location.href = '/';
  };

  const statusColor = (s) => s === 'OK' ? '#27ae60' : s === 'ERROR' ? '#f39c12' : '#e74c3c';
  const waterColor = water?.status === 'Critical' ? '#e74c3c' : water?.status === 'Alert' ? '#f39c12' : '#27ae60';
  const openComplaints = complaints.filter((c) => c.status === 'Open').length;

  return (
    <div className={styles.pageContainer}>
      <Head><title>Admin Dashboard - ระบบจัดการน้ำประปา</title></Head>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p className={styles.pageIntro}>ศูนย์ควบคุมระบบน้ำประปาทั้งหมด — IoT · ฐานข้อมูล · การตั้งค่า · ผู้ใช้งาน</p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionButton} onClick={loadData}>🔄 รีเฟรช</button>
          <Link href="/maintenance" className={styles.secondaryButton}>🔧 หน้าผู้ดูแล</Link>
          <Link href="/user" className={styles.secondaryButton}>👥 หน้าชาวบ้าน</Link>
          <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>

      {msg && <div className={styles.successMessage} style={{ marginBottom: '1rem' }}>{msg}</div>}

      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <>
          {/* ══════════════════════════════════════
              1. SYSTEM STATUS OVERVIEW
          ══════════════════════════════════════ */}
          <div className={styles.gridTwo} style={{ marginBottom: '1.5rem' }}>
            {/* Water Status */}
            <div className={styles.card} style={{ borderLeft: `5px solid ${waterColor}` }}>
              <h2 style={{ marginTop: 0 }}>💧 สถานะน้ำ</h2>
              <p>ความขุ่น: <strong style={{ color: waterColor }}>{water?.turbidity ?? '-'} NTU</strong></p>
              <p>ระดับ: <strong>{water?.level ?? '-'}</strong></p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                อัปเดต: {water?.timestamp ? new Date(water.timestamp).toLocaleString('th-TH') : '-'}
              </p>
            </div>
            {/* Quick Stats */}
            <div className={styles.card}>
              <h2 style={{ marginTop: 0 }}>📊 ภาพรวมระบบ</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: '🪣 ล้างถัง', val: maintenance.length, color: '#3498db' },
                  { label: '📋 แผนงาน', val: plans.length, color: '#9b59b6' },
                  { label: '📣 ร้องเรียน (รอ)', val: openComplaints, color: openComplaints > 0 ? '#e74c3c' : '#27ae60' },
                  { label: '📜 ประวัติ', val: history.length, color: '#27ae60' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.8rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '0.82rem', color: '#666' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              2. IOT SENSOR MANAGEMENT
          ══════════════════════════════════════ */}
          <Section icon="📡" title="จัดการ IoT Sensor (เซ็นเซอร์วัดน้ำ)">
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>
              อัปเดตค่าความขุ่น (Turbidity) ที่ได้รับจากเซ็นเซอร์ตรวจสอบน้ำ หรือกรอกค่าทดสอบสำหรับสาธิต
            </p>
            <button className={styles.secondaryButton} onClick={() => toggle('iot')}>
              {panels.iot ? '▲ ซ่อน' : '▼ แสดง / อัปเดตค่า IoT'}
            </button>
            {panels.iot && (
              <form onSubmit={handleUpdateWater} className={styles.formColumn} style={{ marginTop: '1rem' }}>
                <Field label="ค่าความขุ่น (NTU) — ค่าปกติ ≤ 5 NTU">
                  <input type="number" step="0.01" value={turbidity}
                    onChange={(e) => setTurbidity(e.target.value)}
                    placeholder="เช่น 2.5 = ปกติ, 7 = เตือน, 12 = วิกฤติ" required />
                </Field>
                <div style={{ background: '#f0f4f8', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: '#555' }}>
                  💡 <strong>เกณฑ์สถานะ:</strong> ปกติ (≤5) · เตือน (5–10) · วิกฤติ (&gt;10)
                </div>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? 'กำลังส่งข้อมูล...' : '📤 ส่งข้อมูลเซ็นเซอร์'}
                </button>
              </form>
            )}
          </Section>

          {/* ══════════════════════════════════════
              3. API / BACKEND STATUS
          ══════════════════════════════════════ */}
          <Section icon="🌐" title="สถานะ API Backend">
            <button className={styles.secondaryButton} onClick={() => toggle('wifi')}>
              {panels.wifi ? '▲ ซ่อน' : '▼ แสดงสถานะ API ทั้งหมด'}
            </button>
            {panels.wifi && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, color: '#a6e3a1' }}>📍 Backend URL:</p>
                  <p style={{ margin: '0.3rem 0 0', color: '#89b4fa', wordBreak: 'break-all' }}>{apiBase}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {Object.entries(apiStatus).map(([ep, status]) => (
                    <div key={ep} style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      background: '#f8f9fa',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.85rem' }}>/api/{ep}</span>
                      <span style={{ color: statusColor(status), fontWeight: 'bold', fontSize: '0.8rem' }}>{status}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#666' }}>
                  🔑 ตั้งค่า Backend URL ได้ที่ Vercel → Settings → Environment Variables → <code>NEXT_PUBLIC_API_BASE</code>
                </p>
              </div>
            )}
          </Section>

          {/* ══════════════════════════════════════
              4. DATABASE OVERVIEW
          ══════════════════════════════════════ */}
          <Section icon="🗄️" title="ฐานข้อมูล MongoDB">
            <button className={styles.secondaryButton} onClick={() => toggle('db')}>
              {panels.db ? '▲ ซ่อน' : '▼ แสดงข้อมูลในฐานข้อมูล'}
            </button>
            {panels.db && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  {[
                    { name: 'Maintenances', count: maintenance.length, icon: '🪣' },
                    { name: 'Plans', count: plans.length, icon: '📋' },
                    { name: 'Complaints', count: complaints.length, icon: '📣' },
                    { name: 'Histories', count: history.length, icon: '📜' },
                    { name: 'Admins', count: admins.length, icon: '👤' },
                  ].map((col) => (
                    <div key={col.name} style={{ background: '#f0f4f8', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>{col.icon}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#2c3e50' }}>{col.count}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Collection: <code>{col.name}</code></div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', marginTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.3rem', color: '#a6e3a1' }}>📦 Database: water_management</p>
                  <p style={{ margin: '0', color: '#89b4fa', fontSize: '0.82rem' }}>ดูข้อมูลจริงได้ที่: cloud.mongodb.com → Browse Collections</p>
                </div>
              </div>
            )}
          </Section>

          {/* ══════════════════════════════════════
              5. ALERTS
          ══════════════════════════════════════ */}
          <Section icon="🔔" title="การแจ้งเตือนระบบ" badge={alerts.filter(a => a.active).length + ' รายการ'} badgeColor={alerts.some(a => a.active) ? '#e74c3c' : '#27ae60'}>
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
          </Section>

          {/* ══════════════════════════════════════
              6. COMPLAINTS
          ══════════════════════════════════════ */}
          <Section icon="📣" title="เรื่องร้องเรียนจากชาวบ้าน" badge={`รอดำเนินการ: ${openComplaints}`} badgeColor={openComplaints > 0 ? '#e74c3c' : '#27ae60'}>
            <div className={styles.gridTwo}>
              {complaints.length === 0 ? <p>ยังไม่มีเรื่องร้องเรียน</p> : complaints.map((item) => (
                <div key={item._id || item.id} className={styles.alertCard} style={{ borderLeft: `4px solid ${item.status === 'Open' ? '#e74c3c' : '#27ae60'}` }}>
                  <p><strong>{item.topic}</strong></p>
                  <p>👤 {item.name} | 📞 {item.phone}</p>
                  <p>{item.message}</p>
                  <p style={{ fontSize: '0.82rem', color: '#666' }}>📅 {new Date(item.submittedAt).toLocaleString('th-TH')}</p>
                  <p style={{ fontWeight: 'bold', color: item.status === 'Open' ? '#e74c3c' : '#27ae60' }}>
                    {item.status === 'Open' ? '🔴 รอดำเนินการ' : '🟢 เสร็จแล้ว'}
                  </p>
                  {item.status === 'Open' && (
                    <button className={styles.smallButton} onClick={() => handleResolveComplaint(item._id || item.id)}>
                      ✓ ปิดงาน
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════
              7. MAINTENANCE RECORDS
          ══════════════════════════════════════ */}
          <Section icon="🪣" title="บันทึกการล้างถัง">
            <button className={styles.secondaryButton} onClick={() => toggle('addMaintenance')}>
              {panels.addMaintenance ? '▲ ซ่อน' : '+ เพิ่มบันทึก'}
            </button>
            {panels.addMaintenance && (
              <form onSubmit={handleAddMaintenance} className={styles.formColumn} style={{ margin: '1rem 0' }}>
                <Field label="วันที่"><input type="date" value={newMaintenance.date} onChange={(e) => setNewMaintenance(p => ({ ...p, date: e.target.value }))} required /></Field>
                <Field label="เหตุผล"><input value={newMaintenance.reason} onChange={(e) => setNewMaintenance(p => ({ ...p, reason: e.target.value }))} placeholder="เช่น ล้างถังตามกำหนด" required /></Field>
                <Field label="หมายเหตุ"><textarea value={newMaintenance.note} onChange={(e) => setNewMaintenance(p => ({ ...p, note: e.target.value }))} rows={3} /></Field>
                <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </form>
            )}
            <div className={styles.gridTwo}>
              {maintenance.length === 0 ? <p>ยังไม่มีบันทึก</p> : maintenance.map((r, i) => (
                <div key={i} className={styles.alertCard}>
                  <p>📅 <strong>{r.date}</strong></p>
                  <p>{r.reason}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>{r.note || '-'}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════
              8. PLANS
          ══════════════════════════════════════ */}
          <Section icon="📋" title="แผนการบำรุงรักษา">
            <button className={styles.secondaryButton} onClick={() => toggle('addPlan')}>
              {panels.addPlan ? '▲ ซ่อน' : '+ สร้างแผนใหม่'}
            </button>
            {panels.addPlan && (
              <form onSubmit={handleAddPlan} className={styles.formColumn} style={{ margin: '1rem 0' }}>
                <Field label="วันที่กำหนด"><input type="date" value={newPlan.scheduleDate} onChange={(e) => setNewPlan(p => ({ ...p, scheduleDate: e.target.value }))} required /></Field>
                <Field label="รายละเอียด"><input value={newPlan.description} onChange={(e) => setNewPlan(p => ({ ...p, description: e.target.value }))} placeholder="เช่น ตรวจสอบถังหลัก" required /></Field>
                <Field label="ผู้รับผิดชอบ"><input value={newPlan.assignedTo} onChange={(e) => setNewPlan(p => ({ ...p, assignedTo: e.target.value }))} placeholder="เช่น นายสมชาย" required /></Field>
                <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}</button>
              </form>
            )}
            <div className={styles.gridTwo}>
              {plans.length === 0 ? <p>ยังไม่มีแผนงาน</p> : plans.map((p, i) => (
                <div key={i} className={styles.alertCard}>
                  <p>📅 <strong>{p.scheduleDate}</strong></p>
                  <p>{p.description}</p>
                  <p>👤 {p.assignedTo}</p>
                  <p style={{ color: p.status === 'Done' ? '#27ae60' : '#f39c12', fontWeight: 'bold' }}>{p.status}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════
              9. ADMIN USERS
          ══════════════════════════════════════ */}
          <Section icon="👤" title="ผู้ดูแลระบบ">
            <button className={styles.secondaryButton} onClick={() => toggle('addAdmin')}>
              {panels.addAdmin ? '▲ ซ่อน' : '+ เพิ่มผู้ดูแล'}
            </button>
            {panels.addAdmin && (
              <form onSubmit={handleAddAdmin} className={styles.formColumn} style={{ margin: '1rem 0' }}>
                <Field label="ชื่อ"><input value={newAdmin.name} onChange={(e) => setNewAdmin(p => ({ ...p, name: e.target.value }))} required /></Field>
                <Field label="เบอร์โทร"><input value={newAdmin.phone} onChange={(e) => setNewAdmin(p => ({ ...p, phone: e.target.value }))} /></Field>
                <Field label="หมายเหตุ"><textarea value={newAdmin.note} onChange={(e) => setNewAdmin(p => ({ ...p, note: e.target.value }))} rows={3} /></Field>
                <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ดูแล'}</button>
              </form>
            )}
            <div className={styles.gridTwo}>
              {admins.length === 0 ? <p>ยังไม่มีผู้ดูแล</p> : admins.map((a, i) => (
                <div key={i} className={styles.alertCard}>
                  <p><strong>{a.name}</strong></p>
                  <p>📞 {a.phone}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>{a.note}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════
              10. CONTACT / SYSTEM SETTINGS
          ══════════════════════════════════════ */}
          <Section icon="📞" title="ตั้งค่าข้อมูลติดต่อผู้ดูแล">
            <div className={styles.alertCard} style={{ marginBottom: '1rem' }}>
              <p><strong>{contact.name || '-'}</strong></p>
              <p>📞 {contact.phone || '-'}</p>
              <p>{contact.note || '-'}</p>
            </div>
            <button className={styles.secondaryButton} onClick={() => toggle('editContact')}>
              {panels.editContact ? '▲ ซ่อน' : '✏️ แก้ไขข้อมูลติดต่อ'}
            </button>
            {panels.editContact && (
              <form onSubmit={handleUpdateContact} className={styles.formColumn} style={{ marginTop: '1rem' }}>
                <Field label="ชื่อผู้ดูแล"><input value={editContact.name} onChange={(e) => setEditContact(p => ({ ...p, name: e.target.value }))} /></Field>
                <Field label="เบอร์โทร"><input value={editContact.phone} onChange={(e) => setEditContact(p => ({ ...p, phone: e.target.value }))} /></Field>
                <Field label="หมายเหตุ"><textarea value={editContact.note} onChange={(e) => setEditContact(p => ({ ...p, note: e.target.value }))} rows={3} /></Field>
                <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลติดต่อ'}</button>
              </form>
            )}
          </Section>

          {/* ══════════════════════════════════════
              11. LOGIN SETTINGS (Static info)
          ══════════════════════════════════════ */}
          <Section icon="🔐" title="ตั้งค่าระบบ Login">
            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.88rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>🔑 รหัสผ่านปัจจุบัน (แก้ได้ที่ <code>frontend/pages/login.js</code>)</p>
              <p style={{ margin: '0 0 0.3rem' }}>├── แอดมิน: <strong>admin123</strong></p>
              <p style={{ margin: '0' }}>└── ผู้ดูแล: <strong>staff123</strong></p>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.5rem' }}>
              💡 สำหรับระบบ Production จริงควรใช้ระบบ JWT Authentication แทน
            </p>
          </Section>

          {/* ══════════════════════════════════════
              12. HISTORY
          ══════════════════════════════════════ */}
          <Section icon="📜" title={`ประวัติทั้งหมด (${history.length} รายการ)`}>
            <div className={styles.gridTwo}>
              {history.length === 0 ? <p>ยังไม่มีประวัติ</p> : history.map((h, i) => (
                <div key={i} className={styles.alertCard}>
                  <p>📅 <strong>{h.date}</strong></p>
                  <p>{h.note}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
