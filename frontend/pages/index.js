import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>ระบบจัดการน้ำประปาหมู่บ้าน</title>
        <meta name="description" content="เลือกระบบผู้ใช้งาน" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%' }}>
          <h1 className={styles.title} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>ระบบจัดการน้ำประปาหมู่บ้าน</h1>
          <p className={styles.description} style={{ fontSize: '1.2rem', color: '#666' }}>
            กรุณาเลือกประเภทผู้เข้าใช้งาน
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* 1. ชาวบ้าน */}
          <Link href="/user" className={styles.card} style={{ textAlign: 'center', padding: '2rem', flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/icon_villager.png" alt="ชาวบ้าน" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1.5rem' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>ชาวบ้าน</h2>
          </Link>

          {/* 2. ผู้ดูแล */}
          <Link href="/maintenance" className={styles.card} style={{ textAlign: 'center', padding: '2rem', flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/icon_Operations.png" alt="ผู้ดูแล" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1.5rem' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>ผู้ดูแล</h2>
          </Link>

          {/* 3. แอดมิน */}
          <Link href="/admin" className={styles.card} style={{ textAlign: 'center', padding: '2rem', flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/admin_icon.png" alt="แอดมิน" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '1.5rem' }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>แอดมิน</h2>
          </Link>
        </div>
      </main>
    </div>
  );
}
