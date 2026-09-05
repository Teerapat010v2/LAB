import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';

registerLocale('th', th);

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [newPlan, setNewPlan] = useState({ scheduleDate: '', description: '', assignedTo: '', routineInterval: '' });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handlePlanChange = (field) => (e) => setNewPlan((p) => ({ ...p, [field]: e.target.value }));

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
      setShowForm(false);
      await loadData();
    } else {
      setMessage(' ไม่สามารถบันทึกแผนงานได้');
    }
    setSaving(false);
  };

  const handleEditClick = (plan) => {
    setNewPlan({ 
      scheduleDate: plan.scheduleDate || '', 
      description: plan.description || '', 
      assignedTo: plan.assignedTo || '', 
      routineInterval: plan.routineInterval || '' 
    });
    setEditingPlanId(plan._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/plans`);
      let json = await response.json();
      
      const statusWeight = {
        'กำลังดำเนินการ': 1,
        'ตามแผน': 1,
        'เสร็จสิ้น': 2
      };
      
      json.sort((a, b) => {
        const wA = statusWeight[a.status] || 99;
        const wB = statusWeight[b.status] || 99;
        if (wA !== wB) return wA - wB;
        if (a.status === 'เสร็จสิ้น') {
          return new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime(); // Newest completed first
        }
        return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime(); // Earliest upcoming first
      });

      setPlans(json);
    } catch (error) {
      console.error('Failed to load plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const authAdmin = localStorage.getItem('auth_admin');
    const authMaintenance = localStorage.getItem('auth_maintenance');
    setIsStaff(!!authAdmin || !!authMaintenance);
    loadData();
  }, []);

  const handleClearCompleted = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนบำรุงรักษาที่ "เสร็จสิ้น" ทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=plans`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        alert('เคลียร์ประวัติแผนบำรุงรักษาสำเร็จ');
      }
    } catch (e) {
      console.error(e);
    }
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

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('auth_admin');

  return (
    <Layout title="แผนการบำรุงรักษาทั้งหมด" subtitle="รายการแผนงานซ่อมบำรุงและล้างถังที่กำหนดไว้">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadData}>รีเฟรชข้อมูล</button>
        {isStaff ? (
          <Link href="/maintenance" className={styles.secondaryButton}>กลับแผงควบคุม</Link>
        ) : (
          <Link href="/user" className={styles.secondaryButton}>กลับหน้าหลัก</Link>
        )}
        {isAdmin && (
          <button className={styles.dangerButton} style={{ marginLeft: 'auto' }} onClick={handleClearCompleted}>
            ลบประวัติที่เสร็จสิ้นแล้ว
          </button>
        )}
      </div>

      {isStaff && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.sectionTitle}>
            <h2>จัดการแผนงาน</h2>
            <button className={styles.secondaryButton} onClick={() => setShowForm((p) => !p)}>
              {showForm ? 'ซ่อนฟอร์ม' : '+ เพิ่ม/แก้ไขแผน'}
            </button>
          </div>
          
          {message && <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>{message}</p>}
          
          {showForm && (
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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className={styles.submitButton} disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}
                </button>
                {editingPlanId && (
                  <button type="button" className={styles.dangerButton} style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                    handleDeletePlan(editingPlanId);
                    setEditingPlanId(null);
                    setShowForm(false);
                  }}>
                    ลบแผนงานนี้
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : plans.length === 0 ? (
        <div className={styles.card}>
          <p>ไม่มีแผนงาน</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>วันที่กำหนด</th>
                <th>รายละเอียดงาน</th>
                <th>ทำซ้ำทุกๆ</th>
                <th>ผู้รับผิดชอบ</th>
                <th style={{ width: '120px' }}>สถานะ</th>
                {isStaff && <th style={{ width: '150px' }}>อัปเดตสถานะ</th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((p, idx) => (
                <tr key={p._id || idx}>
                  <td>{p.scheduleDate ? new Date(p.scheduleDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td><strong>{p.description}</strong></td>
                  <td>{p.routineInterval ? `${p.routineInterval} วัน` : '-'}</td>
                  <td>{p.assignedTo}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ 
                      background: p.status === 'เสร็จสิ้น' ? 'var(--success-light)' : 'var(--primary-light)', 
                      color: p.status === 'เสร็จสิ้น' ? 'var(--success)' : 'var(--primary)' 
                    }}>
                      {p.status}
                    </span>
                  </td>
                  {isStaff && (
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                        {p.status === 'ตามแผน' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(p._id, 'กำลังดำเนินการ')}>
                            กำลังดำเนินการ
                          </button>
                        )}
                        {p.status === 'กำลังดำเนินการ' && (
                          <button className={styles.smallButton} style={{ margin: 0 }} onClick={() => handleUpdateStatus(p._id, 'เสร็จสิ้น')}>
                            เสร็จสิ้น
                          </button>
                        )}
                        <button className={styles.smallButton} style={{ margin: 0, background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={() => handleEditClick(p)}>
                          แก้ไข
                        </button>
                        <button className={styles.smallButton} style={{ margin: 0, background: '#fff', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => handleDeletePlan(p._id)}>
                          ลบ
                        </button>
                        {p.status === 'เสร็จสิ้น' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
