import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function DevicePage() {
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const [wifiForm, setWifiForm] = useState({ ssid: '', password: '', deviceIp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [savedConfig, setSavedConfig] = useState(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('auth_admin');
    if (!isAuth) { window.location.href = '/login?role=admin'; return; }
    loadStatus();
    loadSavedConfig();
  }, []);

  const notify = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 5000);
  };

  const loadStatus = async () => {
    setLoading(true);
    try {
      // Check if device has sent water data recently (within 10 minutes = online)
      const r = await fetch(`${apiBase}/api/water`).then(res => res.json());
      const lastSeen = r?.timestamp ? new Date(r.timestamp) : null;
      const diffMin = lastSeen ? (Date.now() - lastSeen.getTime()) / 60000 : null;
      setDeviceStatus({
        online: diffMin !== null && diffMin < 10,
        lastSeen: lastSeen,
        turbidity: r?.turbidity,
        diffMin: diffMin ? Math.round(diffMin) : null,
      });
    } catch { setDeviceStatus({ online: false, lastSeen: null }); }
    finally { setLoading(false); }
  };

  const loadSavedConfig = async () => {
    try {
      const r = await fetch(`${apiBase}/api/device/config`).then(res => res.json()).catch(() => null);
      if (r?.ssid) setSavedConfig(r);
    } catch {}
  };

  const handleSaveWifi = async (e) => {
    e.preventDefault();
    if (!wifiForm.ssid) { notify('กรุณากรอกชื่อ WiFi (SSID)', 'error'); return; }
    setSaving(true);
    try {
      const r = await fetch(`${apiBase}/api/device/wifi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wifiForm),
      });
      if (r.ok) {
        notify('บันทึกการตั้งค่า WiFi เรียบร้อยแล้ว ESP32 จะดึงค่านี้ไปใช้เมื่อเชื่อมต่อ');
        setSavedConfig({ ssid: wifiForm.ssid, deviceIp: wifiForm.deviceIp });
        setWifiForm({ ssid: '', password: '', deviceIp: '' });
      } else { notify('บันทึกไม่สำเร็จ กรุณาลองใหม่', 'error'); }
    } catch { notify('ไม่สามารถเชื่อมต่อระบบได้', 'error'); }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!confirm('ยืนยันการรีเซ็ตค่า WiFi? ESP32 จะต้องตั้งค่าใหม่')) return;
    setSaving(true);
    try {
      await fetch(`${apiBase}/api/device/reset`, { method: 'POST' });
      notify('ส่งคำสั่งรีเซ็ต WiFi แล้ว ESP32 จะกลับสู่โหมดตั้งค่าเริ่มต้น');
      setSavedConfig(null);
    } catch { notify('ไม่สามารถส่งคำสั่งได้', 'error'); }
    setSaving(false);
  };

  const handleRestart = async () => {
    if (!confirm('ยืนยันการรีสตาร์ทอุปกรณ์?')) return;
    setSaving(true);
    try {
      await fetch(`${apiBase}/api/device/restart`, { method: 'POST' });
      notify('ส่งคำสั่งรีสตาร์ทแล้ว อุปกรณ์จะกลับมาออนไลน์ใน 30-60 วินาที');
    } catch { notify('ไม่สามารถส่งคำสั่งได้', 'error'); }
    setSaving(false);
  };

  return (
    <Layout title="ตั้งค่าอุปกรณ์ IoT" subtitle="จัดการการเชื่อมต่อ ESP32 และการตั้งค่า WiFi ในหมู่บ้าน">

      <div className={styles.buttonRow}>
        <button className={styles.actionButton} onClick={loadStatus}>ตรวจสอบสถานะ</button>
        <Link href="/admin" className={styles.secondaryButton}>กลับแผงควบคุม Admin</Link>
      </div>

      {msg && <div className={msgType === 'error' ? styles.errorMessage : styles.successMessage}>{msg}</div>}

      {/* Device Status */}
      <div className={styles.card} style={{ borderTop: `3px solid ${deviceStatus?.online ? '#22c55e' : '#94a3b8'}` }}>
        <div className={styles.sectionTitle}>
          <h2>สถานะอุปกรณ์ ESP32</h2>
          <span className={styles.statusBadge} style={{
            background: deviceStatus?.online ? '#dcfce7' : '#f1f5f9',
            color: deviceStatus?.online ? '#16a34a' : '#64748b'
          }}>
            <span className={`${styles.dot} ${deviceStatus?.online ? styles.dotOnline : styles.dotOffline}`} />
            {loading ? 'กำลังตรวจสอบ...' : deviceStatus?.online ? 'ออนไลน์' : 'ออฟไลน์'}
          </span>
        </div>

        <div className={styles.gridTwo} style={{ marginBottom: 0 }}>
          <div className={styles.alertCard}>
            <p><strong>พบการส่งข้อมูลล่าสุด</strong></p>
            <p>{deviceStatus?.lastSeen ? deviceStatus.lastSeen.toLocaleString('th-TH') : 'ไม่พบข้อมูล'}</p>
            {deviceStatus && deviceStatus.diffMin !== null && (
              <p>{deviceStatus.diffMin < 10 ? `${deviceStatus.diffMin} นาทีที่ผ่านมา` : `${deviceStatus.diffMin} นาทีที่ผ่านมา (อาจออฟไลน์)`}</p>
            )}
          </div>
          <div className={styles.alertCard}>
            <p><strong>ค่าความขุ่นล่าสุด</strong></p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {deviceStatus?.turbidity ?? '-'} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>NTU</span>
            </p>
          </div>
        </div>

        {savedConfig && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--primary-light)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)' }}>
              <strong>WiFi ที่บันทึกไว้:</strong> {savedConfig.ssid}
              {savedConfig.deviceIp && <span> | IP: {savedConfig.deviceIp}</span>}
            </p>
          </div>
        )}
      </div>

      {/* WiFi Config */}
      <div className={styles.card}>
        <div className={styles.sectionTitle}><h2>ตั้งค่า WiFi สำหรับ ESP32</h2></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          กรอกชื่อและรหัสผ่าน WiFi บ้าน ระบบจะบันทึกไว้ให้ ESP32 ดึงมาใช้ตอนเชื่อมต่อครั้งแรก
        </p>
        <form onSubmit={handleSaveWifi} className={styles.formColumn}>
          <div className={styles.formField}>
            <label>ชื่อ WiFi (SSID)</label>
            <input value={wifiForm.ssid} onChange={e => setWifiForm(p => ({ ...p, ssid: e.target.value }))}
              placeholder="เช่น MyHomeWiFi" required />
          </div>
          <div className={styles.formField}>
            <label>รหัสผ่าน WiFi</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={wifiForm.password}
                onChange={e => setWifiForm(p => ({ ...p, password: e.target.value }))}
                placeholder="รหัสผ่าน WiFi"
                style={{ width: '100%', paddingRight: '90px' }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {showPassword ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
          </div>
          <div className={styles.formField}>
            <label>IP Address ของ ESP32 (ถ้าทราบ)</label>
            <input value={wifiForm.deviceIp} onChange={e => setWifiForm(p => ({ ...p, deviceIp: e.target.value }))}
              placeholder="เช่น 192.168.1.105" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ไม่บังคับ — ใช้สำหรับสั่งการอุปกรณ์โดยตรง</span>
          </div>
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.actionButton} disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า WiFi'}
            </button>
          </div>
        </form>
      </div>

      {/* Device Commands */}
      <div className={styles.card}>
        <div className={styles.sectionTitle}><h2>คำสั่งควบคุมอุปกรณ์</h2></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          คำสั่งเหล่านี้จะถูกบันทึกไว้ในระบบ และ ESP32 จะดึงไปทำงานเมื่อเชื่อมต่ออินเทอร์เน็ต
        </p>
        <div className={styles.buttonRow}>
          <button className={styles.secondaryButton} onClick={handleRestart} disabled={saving}>
            รีสตาร์ทอุปกรณ์
          </button>
          <button className={styles.dangerButton} onClick={handleReset} disabled={saving}>
            รีเซ็ตค่า WiFi
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          หากกด "รีเซ็ตค่า WiFi" ESP32 จะลบค่า WiFi เดิมและเปิดโหมด Access Point (WaterSystem_Setup) เพื่อตั้งค่าใหม่
        </p>
      </div>

      {/* ESP32 Setup Guide */}
      <div className={styles.card}>
        <div className={styles.sectionTitle}><h2>คู่มือการตั้งค่า ESP32 ครั้งแรก</h2></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { step: '1', title: 'Upload โค้ดลง ESP32', desc: 'นำโค้ดจากโฟลเดอร์ /firmware ไปอัปโหลดผ่าน Arduino IDE หรือ PlatformIO' },
            { step: '2', title: 'เชื่อมต่อ WiFi ตั้งต้น', desc: 'ESP32 จะสร้าง Hotspot ชื่อ "WaterSystem_Setup" ให้เชื่อมต่อโทรศัพท์เข้าไป แล้วเปิด http://192.168.4.1' },
            { step: '3', title: 'กรอกข้อมูล WiFi บ้าน', desc: 'กรอก SSID และรหัสผ่าน WiFi ที่ต้องการให้ ESP32 เชื่อมต่อ พร้อมกรอก API URL ของ Backend' },
            { step: '4', title: 'API URL สำหรับ ESP32', desc: `ใช้ URL นี้ในโค้ด ESP32: ${apiBase}/api/water (POST ส่งค่า turbidity)` },
            { step: '5', title: 'ทดสอบการส่งข้อมูล', desc: 'กลับมาดูที่หน้านี้ ถ้าสถานะขึ้น "ออนไลน์" และมีค่า NTU แสดงว่าสำเร็จ' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                {s.step}
              </div>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className={styles.divider} />

        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ตัวอย่างโค้ด ESP32 สำหรับส่งข้อมูล:</p>
        <div className={styles.codeBlock}>
{`// POST ข้อมูลความขุ่นไปที่ Backend
HTTPClient http;
http.begin("${apiBase}/api/water");
http.addHeader("Content-Type", "application/json");
String body = "{\\"turbidity\\":" + String(turbidityValue) + "}";
int code = http.POST(body);
http.end();`}
        </div>
      </div>

    </Layout>
  );
}
