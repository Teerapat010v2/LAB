import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/history`);
      const json = await response.json();
      setHistory(json);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (!localStorage.getItem('auth_admin')) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบประวัติได้');
      return;
    }
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติทั่วไปทั้งหมด?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/clear-completed?type=history`, { method: 'DELETE' });
      if (res.ok) {
        await loadHistory();
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categorizedHistory = {
    all: history,
    plan: history.filter(h => (h.note || h.reason || '').includes('บันทึกประวัติการบำรุงรักษา')),
    complaint: history.filter(h => (h.note || h.reason || '').includes('แก้ไขเรื่องร้องเรียนเรียบร้อย')),
    bug: history.filter(h => (h.note || h.reason || '').includes('แก้ไขปัญหาระบบเรียบร้อย')),
  };
  
  categorizedHistory.other = history.filter(h => 
    !(h.note || h.reason || '').includes('บันทึกประวัติการบำรุงรักษา') &&
    !(h.note || h.reason || '').includes('แก้ไขเรื่องร้องเรียนเรียบร้อย') &&
    !(h.note || h.reason || '').includes('แก้ไขปัญหาระบบเรียบร้อย')
  );

  const displayedHistory = categorizedHistory[filter] || history;

  return (
    <Layout title="ประวัติการทำงานทั้งหมด" subtitle="ดูรายการบำรุงรักษาและประวัติการดำเนินงานย้อนหลัง">
      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadHistory}>
          รีเฟรชประวัติ
        </button>
        <button className={styles.secondaryButton} onClick={() => window.history.back()}>
          ย้อนกลับ
        </button>
        {typeof window !== 'undefined' && localStorage.getItem('auth_admin') && (
          <button className={styles.dangerButton} style={{ marginLeft: 'auto' }} onClick={handleClear}>
            ลบประวัติทั้งหมด
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className={filter === 'all' ? styles.actionButton : styles.secondaryButton} onClick={() => setFilter('all')}>
          ทั้งหมด ({categorizedHistory.all.length})
        </button>
        <button className={filter === 'plan' ? styles.actionButton : styles.secondaryButton} onClick={() => setFilter('plan')}>
          จากแผนงาน ({categorizedHistory.plan.length})
        </button>
        <button className={filter === 'complaint' ? styles.actionButton : styles.secondaryButton} onClick={() => setFilter('complaint')}>
          จากร้องเรียน ({categorizedHistory.complaint.length})
        </button>
        <button className={filter === 'bug' ? styles.actionButton : styles.secondaryButton} onClick={() => setFilter('bug')}>
          จากผู้ดูแล/แจ้งปัญหา ({categorizedHistory.bug.length})
        </button>
        <button className={filter === 'other' ? styles.actionButton : styles.secondaryButton} onClick={() => setFilter('other')}>
          ทั่วไป ({categorizedHistory.other.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      ) : history.length === 0 ? (
        <div className={styles.card}>
          <p>ยังไม่มีประวัติ</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>วันที่</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>ไม่มีประวัติในหมวดหมู่นี้</td>
                </tr>
              ) : (
                displayedHistory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</td>
                    <td>{item.note || item.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
