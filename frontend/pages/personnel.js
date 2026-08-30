import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function PersonnelPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '', role: 'maintenance', note: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admins`);
      setAdmins(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (!localStorage.getItem('auth_admin')) {
      window.location.href = '/login?role=admin';
      return;
    }
    loadData();
  }, []);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${apiBase}/api/admins/${editingId}` : `${apiBase}/api/admins`;
    
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (r.ok) {
      notify(editingId ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มเจ้าหน้าที่เรียบร้อยแล้ว');
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', role: 'maintenance', note: '' });
      await loadData();
    }
    setSaving(false);
  };

  const handleEdit = (a) => {
    setEditingId(a._id);
    setFormData({ name: a.name, phone: a.phone, role: a.role, note: a.note || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('ต้องการลบเจ้าหน้าที่คนนี้หรือไม่?')) return;
    const r = await fetch(`${apiBase}/api/admins/${id}`, { method: 'DELETE' });
    if (r.ok) {
      notify('ลบเจ้าหน้าที่สำเร็จ');
      await loadData();
    }
  };

  return (
    <Layout title="จัดการบุคลากร" subtitle="เพิ่ม ลบ แก้ไข ข้อมูลเจ้าหน้าที่และผู้ดูแลระบบ">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        <Link href="/admin" className={styles.secondaryButton}>กลับแผงควบคุม Admin</Link>
      </div>

      {msg && <div className={styles.successMessage}>{msg}</div>}

      <div className={styles.card}>
        <div className={styles.sectionTitle}>
          <h2>รายชื่อบุคลากรทั้งหมด</h2>
          <button className={styles.secondaryButton} onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({name:'', phone:'', role:'maintenance', note:''}); }}>
            {showForm ? 'ยกเลิก' : '+ เพิ่มบุคลากรใหม่'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.formColumn} style={{ marginBottom: '2rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'แก้ไขข้อมูล' : 'เพิ่มบุคลากรใหม่'}</h3>
            <div className={styles.formField}>
              <label>ชื่อ - นามสกุล</label>
              <input required value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
            </div>
            <div className={styles.formField}>
              <label>เบอร์โทรศัพท์</label>
              <input required value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} />
            </div>
            <div className={styles.formField}>
              <label>ตำแหน่ง (Role)</label>
              <select value={formData.role} onChange={(e) => setFormData(p => ({...p, role: e.target.value}))}>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                <option value="maintenance">ช่างประปา (Maintenance)</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label>หมายเหตุ / หน้าที่รับผิดชอบ</label>
              <textarea value={formData.note} onChange={(e) => setFormData(p => ({...p, note: e.target.value}))} rows={2} />
            </div>
            <button type="submit" className={styles.submitButton} disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </form>
        )}

        {loading ? <p>กำลังโหลด...</p> : admins.length === 0 ? <p>ไม่มีข้อมูลบุคลากร</p> : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
                  <th>เบอร์โทร</th>
                  <th>หมายเหตุ</th>
                  <th style={{ width: '150px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.name}</strong></td>
                    <td>
                      <span className={styles.statusBadge} style={{ background: a.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: a.role === 'admin' ? '#dc2626' : '#4f46e5' }}>
                        {a.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td>{a.phone}</td>
                    <td>{a.note || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={styles.smallButton} onClick={() => handleEdit(a)}>แก้ไข</button>
                        <button className={styles.smallButton} style={{ background: '#fee2e2', color: '#dc2626' }} onClick={() => handleDelete(a._id)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
