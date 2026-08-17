import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>ระบบจัดการน้ำประปาหมู่บ้าน</title>
        <meta name="description" content="แอป frontend สำหรับระบบจัดการน้ำหมู่บ้าน" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>ระบบจัดการน้ำประปาหมู่บ้าน</h1>
            <p className={styles.description}>
              หน้าเว็บสำหรับดูข้อมูลความขุ่น แจ้งเตือน และบันทึกการล้างถังน้ำ
            </p>
          </div>
          <div className={styles.buttonRow}>
            <Link href="/water" className={styles.actionButton}>
              ดูสถานะน้ำ
            </Link>
            <Link href="/user" className={styles.secondaryButton}>
              ระบบสำหรับประชาชน
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <Link href="/user" className={styles.card}>
            <h2>ระบบบริการประชาชน &rarr;</h2>
            <p>เข้าสู่ระบบสำหรับประชาชน เพื่อติดตามสถานะน้ำ แจ้งปัญหา และดูประวัติการบำรุงรักษา</p>
          </Link>

          <Link href="/admin" className={styles.card}>
            <h2>ผู้ดูแลระบบ (Admin) &rarr;</h2>
            <p>หน้าจัดการสำหรับบันทึกการล้างถัง วางแผน และจัดการเรื่องร้องเรียน</p>
          </Link>

          <Link href="/maintenance" className={styles.card}>
            <h2>บันทึกบำรุงรักษา &rarr;</h2>
            <p>ดูรายการบำรุงรักษาและสถานะการล้างถังล่าสุด</p>
          </Link>

          <Link href="/history" className={styles.card}>
            <h2>ประวัติการล้าง &rarr;</h2>
            <p>ค้นหาประวัติการล้างถังย้อนหลังทั้งหมด</p>
          </Link>

          <Link href="/contact" className={styles.card}>
            <h2>ติดต่อผู้ดูแลระบบ &rarr;</h2>
            <p>ดูรายชื่อผู้ดูแลระบบและช่องทางติดต่อฉุกเฉิน</p>
          </Link>

          <Link href="/swagger" className={styles.card}>
            <h2>เอกสาร API &rarr;</h2>
            <p>ดูคู่มือ API และทดสอบ endpoint ได้ทันที</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

