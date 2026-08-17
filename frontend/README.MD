# README สำหรับ Frontend

## ภาพรวม
- ส่วน Frontend เชื่อมต่อกับ Backend ผ่าน API
- ออกแบบส่วนติดต่อผู้ใช้โดยเน้นมือถือเป็นหลัก (Mobile-First Design)
- สไตล์ถูกออกแบบด้วย Custom CSS ล้วนแบบ Clean & Minimal (ไม่ได้ใช้งาน Material Design)
- ใช้เฟรมเวิร์ก: Next.js (Pages Router)

## โครงสร้าง
- `pages/`: เก็บ React components ที่เป็นหน้าเว็บหลัก (e.g., `index.js`, `user.js`, `admin.js`)
- `styles/`: เก็บไฟล์ CSS ทั้งหมด โดย `globals.css` เป็นไฟล์ตั้งค่าโทนสี/ฟอนต์หลัก และ `Home.module.css` จัดการสไตล์ของคลาสทั้งหมด
- `public/`: เก็บไฟล์ภาพและ Assets อื่นๆ

## การเชื่อมต่อ API
ส่วน Frontend จะดึงข้อมูลจาก Backend ที่รันบน `http://localhost:5000` โดยผ่าน Endpoint เหล่านี้:
- `/api/water`: ดึงข้อมูลระดับความขุ่นและสถานะ
- `/api/maintenance`: ดึงประวัติการบำรุงรักษา
- `/api/history`: ดึงประวัติการล้างถังทั้งหมด
- `/api/alert`: ดึงข้อมูลการแจ้งเตือน
- `/api/admins`: ดึงข้อมูลผู้ดูแลระบบ
- `/api/plans`: จัดการแผนการล้างถัง
- `/api/complaints`: จัดการและรับข้อร้องเรียนจากประชาชน

## การรันเซิร์ฟเวอร์
ในการรันเซิร์ฟเวอร์ Frontend ให้ใช้คำสั่งต่อไปนี้:
```bash
npm install
npm run dev
```
เซิร์ฟเวอร์จะถูกรันที่ `http://localhost:3000` 
*หมายเหตุ: ต้องมั่นใจว่าเปิดรัน Backend Server อยู่ด้วยเพื่อไม่ให้เกิด Error "Failed to fetch"*
