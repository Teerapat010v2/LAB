import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

const Section = ({ title, linkTo, totalItems, children, noBorder }) => (
  <div className={styles.card} style={noBorder ? { borderTop: '3px solid var(--primary)' } : {}}>
    <div className={styles.sectionTitle}>
      <h2>{title}</h2>
    </div>
    {children}
    {linkTo && totalItems > 4 && (
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link href={linkTo} className={styles.secondaryButton} style={{ width: '100%' }}>
          ดูทั้งหมด (มีอีก {totalItems - 4} รายการ)
        </Link>
      </div>
    )}
  </div>
);

const Field = ({ label, children }) => (
  <div className={styles.formField}>
    <label>{label}</label>
    {children}
  </div>
);

export default function AdminPage() {
  const [data, setData] = useState({
    water: null, alerts: [], admins: [], maintenance: [],
    plans: [], bugs: [], contact: {}, history: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [panels, setPanels] = useState({});
  const toggle = (p) => setPanels(s => ({ ...s, [p]: !s[p] }));

  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', note: '' });
  const [editContact, setEditContact] = useState({ name: '', phone: '', note: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await Promise.all([
        fetch(`${apiBase}/api/water`).then(r => r.json()).catch(()=>null),
        fetch(`${apiBase}/api/alert`).then(r => r.json()).catch(()=>({alerts:[]})),
        fetch(`${apiBase}/api/admins`).then(r => r.json()).catch(()=>[]),
        fetch(`${apiBase}/api/maintenance`).then(r => r.json()).catch(()=>[]),
        fetch(`${apiBase}/api/plans`).then(r => r.json()).catch(()=>[]),
        fetch(`${apiBase}/api/bugs`).then(r => r.json()).catch(()=>[]),
        fetch(`${apiBase}/api/contact`).then(r => r.json()).catch(()=>({})),
        fetch(`${apiBase}/api/history`).then(r => r.json()).catch(()=>[])
      ]);
      setData({
        water: res[0], alerts: res[1].alerts||[], admins: res[2], maintenance: res[3],
        plans: res[4], bugs: res[5], contact: res[6], history: res[7]
      });
      setEditContact(res[6]);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!localStorage.getItem('auth_admin')) {
      window.location.href = '/login?role=admin';
      return;
    }
    loadData();
  }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleUpdateContact = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await fetch(`${apiBase}/api/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editContact),
    });
    if (r.ok) { notify('อัปเดตข้อมูลติดต่อแล้ว'); toggle('editContact'); await loadData(); }
    setSaving(false);
  };

  const handleUpdateBugStatus = async (id, status) => {
    const res = await fetch(`${apiBase}/api/bugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      notify('อัปเดตสถานะบั๊กแล้ว');
      await loadData();
    }
  };

  return (
    <Layout title="แผงควบคุม Admin" subtitle="ระบบควบคุมหลังบ้าน จัดการตั้งค่า และดูแลข้อมูลทั้งหมด">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/maintenance" className={styles.secondaryButton}>ไปหน้าผู้ดูแลประปา</Link>
        <Link href="/device" className={styles.secondaryButton}>ตั้งค่าอุปกรณ์ (IoT)</Link>
        <Link href="/personnel" className={styles.secondaryButton} style={{ background: '#4f46e5', color: 'white' }}>จัดการบุคลากร</Link>
      </div>

      {msg && <div className={styles.successMessage}>{msg}</div>}

      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <>
          <Section title="ภาพรวมระบบ (System Overview)" noBorder>
            <div className={styles.statGrid}>
              <div className={styles.statTile}>
                <div className={styles.val}>
                  {data.water?.level || '-'}
                </div>
                <div className={styles.lbl}>ระดับน้ำ</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.val}>{data.water?.turbidity || '-'}</div>
                <div className={styles.lbl}>ความขุ่น (NTU)</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.val}>
                  {data.bugs.filter(c=>c.status!=='เสร็จงาน').length}
                </div>
                <div className={styles.lbl}>บั๊กที่รอแก้</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.val}>{data.alerts.length}</div>
                <div className={styles.lbl}>แจ้งเตือนระบบ</div>
              </div>
            </div>
          </Section>

          <Section title="รายงานบั๊กของระบบ" totalItems={data.bugs.length}>
            <div className={styles.gridTwo}>
              {data.bugs.length === 0 ? <p>ไม่มีรายงานบั๊ก</p> : data.bugs.slice(0,4).map(c => (
                <div key={c._id} className={styles.alertCard}>
                  <p><strong>{c.topic}</strong></p>
                  <p>{c.message}</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginTop: '0.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    สถานะ: {c.status}
                  </p>
                  {c.status !== 'เสร็จงาน' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button className={styles.smallButton} onClick={() => handleUpdateBugStatus(c._id, 'กำลังดำเนินการ')}>
                        รับเรื่อง/กำลังแก้
                      </button>
                      <button className={styles.smallButton} style={{ background: '#10b981', color: 'white' }} onClick={() => handleUpdateBugStatus(c._id, 'เสร็จงาน')}>
                        แก้ไขเสร็จสิ้น
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="บันทึกการล้างถัง" linkTo="/maintenance-logs" totalItems={data.maintenance.length}>
            <div className={styles.gridTwo}>
              {data.maintenance.length === 0 ? <p>ไม่มีบันทึก</p> : data.maintenance.slice(0,4).map((m,i) => (
                <div key={i} className={styles.alertCard}>
                  <p>วันที่: {m.date ? new Date(m.date).toLocaleDateString('th-TH') : '-'}</p>
                  <p>เหตุผล: <strong>{m.reason}</strong></p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="แผนการบำรุงรักษา" linkTo="/plans" totalItems={data.plans.length}>
            <div className={styles.gridTwo}>
              {data.plans.length === 0 ? <p>ไม่มีแผนงาน</p> : data.plans.slice(0,4).map((p,i) => (
                <div key={i} className={styles.alertCard}>
                  <p>วันที่: <strong>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</strong></p>
                  <p>{p.description}</p>
                  <p>ผู้รับผิดชอบ: {p.assignedTo}</p>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>สถานะ: {p.status}</p>
                </div>
              ))}
            </div>
          </Section>



          <Section title="ตั้งค่าข้อมูลติดต่อส่วนกลาง">
            <div className={styles.alertCard}>
              <p>ชื่อที่แสดง: <strong>{data.contact.name || '-'}</strong></p>
              <p>เบอร์ติดต่อ: {data.contact.phone || '-'}</p>
            </div>
            <button className={styles.smallButton} onClick={() => toggle('editContact')}>
              {panels.editContact ? 'ซ่อน' : 'แก้ไข'}
            </button>
            {panels.editContact && (
              <form onSubmit={handleUpdateContact} className={styles.formColumn} style={{ marginTop: '1rem' }}>
                <Field label="ชื่อผู้ดูแล"><input value={editContact.name} onChange={(e) => setEditContact(p => ({ ...p, name: e.target.value }))} /></Field>
                <Field label="เบอร์โทร"><input value={editContact.phone} onChange={(e) => setEditContact(p => ({ ...p, phone: e.target.value }))} /></Field>
                <Field label="หมายเหตุ"><textarea value={editContact.note} onChange={(e) => setEditContact(p => ({ ...p, note: e.target.value }))} rows={2} /></Field>
                <button type="submit" className={styles.submitButton} disabled={saving}>บันทึกข้อมูลติดต่อ</button>
              </form>
            )}
          </Section>

          <Section title="ประวัติการบำรุงรักษา" linkTo="/history" totalItems={data.history.length}>
            <div className={styles.gridTwo}>
              {data.history.length === 0 ? <p>ไม่มีประวัติ</p> : data.history.slice(0,4).map((h,i) => (
                <div key={i} className={styles.alertCard}>
                  <p>วันที่: {h.date ? new Date(h.date).toLocaleDateString('th-TH') : '-'}</p>
                  <p>{h.note}</p>
                </div>
              ))}
            </div>
          </Section>

        </>
      )}
    </Layout>
  );
}
