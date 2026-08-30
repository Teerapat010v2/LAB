import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

const Section = ({ title, children, noBorder, totalItems, linkTo, action }) => (
  <div className={styles.card} style={noBorder ? { border: 'none', boxShadow: 'none', padding: 0 } : {}}>
    <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {action && <div>{action}</div>}
    </div>
    {children}
    {totalItems > 4 && linkTo && (
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
  const [editSettings, setEditSettings] = useState({ 
    contactName: 'ผู้ดูแลระบบประปา', 
    contactPhone: '080-123-4567', 
    contactNote: 'ติดต่อเมื่อมีเหตุฉุกเฉิน' 
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.settings) {
          setEditSettings(json.settings);
        }
      }
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

  

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSettings)
      });
      if (res.ok) {
        setMsg('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
        setTimeout(() => setMsg(''), 3000);
        setPanels(p => ({ ...p, editSettings: false }));
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearCompleted = async (type) => {
    let typeLabel = '';
    if (type === 'bugs') typeLabel = 'รายงานบั๊กที่แก้ไขแล้ว';
    if (type === 'plans') typeLabel = 'แผนงานที่เสร็จสิ้นแล้ว';
    
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบประวัติ "${typeLabel}" ทั้งหมดที่เสร็จสิ้นแล้ว?`)) return;
    
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=${type}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        setMsg(`เคลียร์ประวัติ ${typeLabel} สำเร็จ (${json.deletedCount} รายการ)`);
        setTimeout(() => setMsg(''), 5000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
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

  const handleDeleteBug = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) return;
    const res = await fetch(`${apiBase}/api/bugs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify('ลบรายงานบั๊กเรียบร้อยแล้ว');
      await loadData();
    }
  };

  const chartDataWater = (data.waterHistory || []).map(w => ({
    time: new Date(w.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    turbidity: w.turbidity
  }));

  const issueStats = [
    { 
      name: 'รอดำเนินการ', 
      'บั๊กระบบ': data.bugs.filter(b => b.status === 'รอดำเนินการ').length,
      'ร้องเรียน': (data.complaints || []).filter(c => c.status === 'รอดำเนินการ').length
    },
    { 
      name: 'กำลังดำเนินการ', 
      'บั๊กระบบ': data.bugs.filter(b => b.status === 'กำลังดำเนินการ').length,
      'ร้องเรียน': (data.complaints || []).filter(c => c.status === 'กำลังดำเนินการ' || c.status === 'รับงาน').length
    },
    { 
      name: 'เสร็จงาน', 
      'บั๊กระบบ': data.bugs.filter(b => b.status === 'เสร็จงาน').length,
      'ร้องเรียน': (data.complaints || []).filter(c => c.status === 'เสร็จงาน').length
    }
  ];

  return (
    <Layout title="แผงควบคุมระบบ" subtitle="ดูภาพรวมทั้งหมด และจัดการผู้ใช้">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/maintenance" className={styles.secondaryButton}>ไปหน้าผู้ดูแลประปา</Link>
        <Link href="/device" className={styles.secondaryButton}>ตั้งค่าอุปกรณ์ (IoT)</Link>
        <Link href="/personnel" className={styles.secondaryButton} style={{ background: '#4f46e5', color: 'white' }}>จัดการบุคลากร</Link>
      </div>

      {msg && <div className={styles.successMessage}>{msg}</div>}

      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <>
          <Section title="ภาพรวมระบบ" noBorder>
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
                <div className={styles.val}>{data.alerts ? data.alerts.filter(a => a.active && a.type !== 'งานที่กำลังดำเนินการ').length : 0}</div>
                <div className={styles.lbl}>แจ้งเตือนระบบ</div>
              </div>
            </div>

            <div className={styles.gridTwo} style={{ marginTop: '1rem' }}>
              <div className={styles.card} style={{ padding: '1rem', border: '1px solid var(--card-border)', boxShadow: 'none' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>แนวโน้มความขุ่นของน้ำ (10 ครั้งล่าสุด)</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartDataWater}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="turbidity" stroke="#3b82f6" strokeWidth={2} name="ความขุ่น (NTU)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={styles.card} style={{ padding: '1rem', border: '1px solid var(--card-border)', boxShadow: 'none' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>สถิติเรื่องร้องเรียน & บั๊กระบบ</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <BarChart data={issueStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="ร้องเรียน" fill="#f59e0b" />
                      <Bar dataKey="บั๊กระบบ" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Section>

          <Section 
            title="รายงานบั๊กของระบบ" 
            linkTo="/bugs" 
            totalItems={data.bugs.length}
            action={
              <button className={styles.smallButton} style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => handleClearCompleted('bugs')}>
                ลบบั๊กที่แก้ไขแล้ว
              </button>
            }
          >
            <div className={styles.tableWrapper}>
              {data.bugs.length === 0 ? <p style={{ padding: '1rem' }}>ไม่มีรายงานบั๊ก</p> : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>หัวข้อ</th>
                      <th style={{ width: '35%' }}>รายละเอียด</th>
                      <th style={{ width: '15%' }}>สถานะ</th>
                      <th style={{ width: '30%' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bugs.slice(0, 4).map(c => (
                      <tr key={c._id}>
                        <td><strong>{c.topic}</strong></td>
                        <td>{c.message}</td>
                        <td>
                          <span className={styles.statusBadge} style={{ 
                            background: c.status === 'เสร็จงาน' ? 'var(--success-light)' : 'var(--primary-light)', 
                            color: c.status === 'เสร็จงาน' ? 'var(--success)' : 'var(--primary)' 
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {c.status !== 'เสร็จงาน' && (
                              <>
                                <button className={styles.smallButton} style={{ margin: 0, background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={() => handleUpdateBugStatus(c._id, 'กำลังดำเนินการ')}>
                                  รับเรื่อง
                                </button>
                                <button className={styles.smallButton} style={{ margin: 0, background: '#10b981', color: '#fff', border: '1px solid #10b981' }} onClick={() => handleUpdateBugStatus(c._id, 'เสร็จงาน')}>
                                  เสร็จสิ้น
                                </button>
                              </>
                            )}
                            <button className={styles.smallButton} style={{ margin: 0, background: '#fff', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => handleDeleteBug(c._id)}>
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Section>

          <div className={styles.gridTwo} style={{ alignItems: 'flex-start' }}>
            <Section title="บันทึกการทำงานล่าสุด" linkTo="/maintenance-logs" totalItems={data.maintenance.length}>
              <div className={styles.tableWrapper}>
                {data.maintenance.length === 0 ? <p style={{ padding: '1rem' }}>ไม่มีบันทึก</p> : (
                  <table className={styles.table}>
                    <tbody>
                      {data.maintenance.slice(0, 4).map((m, i) => (
                        <tr key={i}>
                          <td style={{ width: '100px', whiteSpace: 'nowrap' }}>{m.date ? new Date(m.date).toLocaleDateString('th-TH') : '-'}</td>
                          <td><strong>{m.reason}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Section>

            <Section title="แผนงานที่กำลังมาถึง" linkTo="/plans" totalItems={data.plans.length}>
              <div className={styles.tableWrapper}>
                {data.plans.length === 0 ? <p style={{ padding: '1rem' }}>ไม่มีแผนงาน</p> : (
                  <table className={styles.table}>
                    <tbody>
                      {data.plans.slice(0, 4).map((p, i) => (
                        <tr key={i}>
                          <td style={{ width: '100px', whiteSpace: 'nowrap' }}>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</td>
                          <td><strong>{p.description}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: p.status === 'เสร็จสิ้น' ? 'var(--success)' : 'var(--primary)', fontWeight: 'bold' }}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Section>
          </div>



          <div className={styles.gridTwo} style={{ alignItems: 'flex-start' }}>
            <Section title="ประวัติการทำงาน" linkTo="/history" totalItems={data.history.length}>
              <div className={styles.tableWrapper}>
                {data.history.length === 0 ? <p style={{ padding: '1rem' }}>ไม่มีประวัติ</p> : (
                  <table className={styles.table}>
                    <tbody>
                      {data.history.slice(0, 4).map((h, i) => (
                        <tr key={i}>
                          <td style={{ width: '100px', whiteSpace: 'nowrap' }}>{h.date ? new Date(h.date).toLocaleDateString('th-TH') : '-'}</td>
                          <td>{h.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Section>

            <Section title="ตั้งค่าระบบส่วนกลาง">
              <div className={styles.alertCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p>ผู้ดูแล: <strong>{data.contact?.name || '-'}</strong></p>
                  <p>โทร: {data.contact?.phone || '-'}</p>
                </div>
                <button className={styles.smallButton} style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={() => toggle('editSettings')}>
                  {panels.editSettings ? 'ซ่อน' : 'แก้ไข'}
                </button>
              </div>
              {panels.editSettings && (
                <form onSubmit={handleUpdateSettings} className={styles.formColumn} style={{ marginTop: '1rem' }}>
                  <Field label="ชื่อผู้ดูแล">
                    <input value={editSettings.contactName} onChange={(e) => setEditSettings(p => ({ ...p, contactName: e.target.value }))} />
                  </Field>
                  <Field label="เบอร์โทร">
                    <input value={editSettings.contactPhone} onChange={(e) => setEditSettings(p => ({ ...p, contactPhone: e.target.value }))} />
                  </Field>
                  <Field label="หมายเหตุ">
                    <textarea value={editSettings.contactNote} onChange={(e) => setEditSettings(p => ({ ...p, contactNote: e.target.value }))} rows={2} />
                  </Field>
                  <button type="submit" className={styles.submitButton} disabled={saving}>บันทึกการตั้งค่า</button>
                </form>
              )}
            </Section>
          </div>

        </>
      )}
    </Layout>
  );
}
