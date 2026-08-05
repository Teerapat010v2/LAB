import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ContactPage() {
  const [contact, setContact] = useState({ name: '', phone: '', note: '' });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadContact = async () => {
    try {
      const response = await fetch(`${apiBase}/api/contact`);
      if (response.ok) {
        const result = await response.json();
        setContact(result);
      }
    } catch (error) {
      console.error('Failed to load contact', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch(`${apiBase}/api/admins`);
      if (response.ok) {
        const result = await response.json();
        setAdmins(result || []);
      }
    } catch (error) {
      console.error('Failed to load admins', error);
    }
  };

  const loadPageData = async () => {
    setLoading(true);
    await Promise.all([loadContact(), loadAdmins()]);
    setLoading(false);
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleChange = (field) => (event) => {
    setContact((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });

      const result = await response.json();
      if (response.ok) {
        setContact(result.contact || contact);
        setMessage('บันทึกข้อมูลผู้ดูแลเรียบร้อยแล้ว');
        loadContact();
      } else {
        setMessage(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Failed to save contact', error);
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>ข้อมูลผู้ดูแลระบบ</h1>
          <p className={styles.pageIntro}>จัดเก็บชื่อผู้ดูแล เบอร์โทร และหมายเหตุสำหรับการติดต่อฉุกเฉิน</p>
        </div>
        <div className={styles.buttonRow}>
          <Link href="/user" className={styles.secondaryButton}>
            ไปหน้าชาวบ้าน
          </Link>
          <Link href="/admin" className={styles.actionButton}>
            ไปหน้าผู้ดูแล
          </Link>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className={styles.card}>
            <h2>ข้อมูลผู้ดูแลหลัก</h2>
            <p><strong>ชื่อ:</strong> {contact.name || '-'}</p>
            <p><strong>เบอร์โทร:</strong> {contact.phone || '-'}</p>
            <p><strong>หมายเหตุ:</strong> {contact.note || '-'}</p>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <h2>ผู้ดูแลทั้งหมด</h2>
            </div>
            {admins.length === 0 ? (
              <p>ยังไม่มีผู้ดูแลที่เพิ่มไว้</p>
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
            <h2>แก้ไขข้อมูลผู้ดูแลหลัก</h2>
            <form onSubmit={handleSubmit} className={styles.formColumn}>
              <div className={styles.formField}>
                <label>ชื่อผู้ดูแล</label>
                <input value={contact.name} onChange={handleChange('name')} placeholder="ชื่อผู้ดูแล" />
              </div>
              <div className={styles.formField}>
                <label>เบอร์โทร</label>
                <input value={contact.phone} onChange={handleChange('phone')} placeholder="080-123-4567" />
              </div>
              <div className={styles.formField}>
                <label>หมายเหตุ</label>
                <textarea value={contact.note} onChange={handleChange('note')} placeholder="หมายเหตุเพิ่มเติม" rows={4} />
              </div>
              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
              {message && <div className={styles.successMessage}>{message}</div>}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
