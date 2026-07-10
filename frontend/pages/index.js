import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>ระบบจัดการน้ำประปาหมู่บ้าน</title>
        <meta name="description" content="แอป frontend สำหรับระบบจัดการน้ำหมู่บ้าน" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>ระบบจัดการน้ำประปาหมู่บ้าน</h1>
        <p className={styles.description}>
          หน้าเว็บสำหรับดูข้อมูลความขุ่น แจ้งเตือน และบันทึกการล้างถังน้ำ
        </p>

        <div className={styles.grid}>
          <Link href="/water" className={styles.card}>
            <h2>ข้อมูลน้ำ &rarr;</h2>
            <p>ดูค่าความขุ่นน้ำและสถานะปัจจุบัน</p>
          </Link>

          <Link href="/maintenance" className={styles.card}>
            <h2>บำรุงรักษา &rarr;</h2>
            <p>บันทึกการล้างถังและจัดการประวัติ</p>
          </Link>

          <Link href="/history" className={styles.card}>
            <h2>ประวัติการล้าง &rarr;</h2>
            <p>ดูประวัติการล้างถังทั้งหมด</p>
          </Link>

          <Link href="/swagger" className={styles.card}>
            <h2>ดูเอกสาร API &rarr;</h2>
            <p>เปิด Swagger UI เพื่อดู API เรียลไทม์</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

