import dynamic from 'next/dynamic';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'ระบบจัดการน้ำประปาหมู่บ้าน',
    version: '1.0.0',
    description: 'API สำหรับติดตามความขุ่นของน้ำ การแจ้งเตือน การบำรุงรักษา และประวัติการล้างถัง',
  },
  servers: [
    { url: 'http://localhost:5000' },
  ],
  paths: {
    '/api/water': {
      get: {
        summary: 'ดึงข้อมูลน้ำปัจจุบัน',
        responses: {
          '200': {
            description: 'คืนค่าความขุ่นและสถานะปัจจุบัน',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    turbidity: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'บันทึกข้อมูลน้ำ',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'บันทึกข้อมูลน้ำเรียบร้อยแล้ว' },
        },
      },
    },
    '/api/maintenance': {
      get: {
        summary: 'ดึงบันทึกการบำรุงรักษา',
        responses: {
          '200': { description: 'รายการบันทึกการบำรุงรักษา' },
        },
      },
      post: {
        summary: 'เพิ่มบันทึกการล้างถัง',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว' },
        },
      },
    },
    '/api/history': {
      get: {
        summary: 'ดึงประวัติการล้างถัง',
        responses: {
          '200': { description: 'รายการประวัติการล้างถัง' },
        },
      },
    },
    '/api/alert': {
      get: {
        summary: 'ดึงการแจ้งเตือนปัจจุบัน',
        responses: {
          '200': { description: 'รายการการแจ้งเตือน' },
        },
      },
    },
  },
};

export default function SwaggerPage() {
  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>เอกสาร API</title>
      </Head>
      <h1>คู่มือ API ระบบน้ำประปาหมู่บ้าน</h1>
      <p>ดูเอกสาร API และทดสอบ endpoint ของ backend ได้จากหน้านี้</p>
      <div className={styles.swaggerContainer}>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}

