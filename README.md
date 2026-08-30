# ระบบดูแลน้ำประปาหมู่บ้าน (Village Water Management System)

โปรเจกต์นี้เป็นแอปพลิเคชันสำหรับตรวจสอบคุณภาพน้ำ ประวัติการบำรุงรักษาถังเก็บน้ำ และจัดการเรื่องร้องเรียนจากชาวบ้าน โดยทำงานบนสถาปัตยกรรมแบบ **Serverless** อย่างเต็มรูปแบบผ่าน **Next.js (Pages Router + API Routes)** ร่วมกับฐานข้อมูล **MongoDB Atlas** และรองรับการทำงานแบบ **PWA (Progressive Web App)**

## ✨ คุณสมบัติหลัก
- **สำหรับประชาชน (Villagers):**
  - ติดตามระดับความขุ่นของน้ำ (Turbidity) แบบเรียลไทม์
  - แจ้งเรื่องร้องเรียนปัญหาประปาและติดตามสถานะ
  - ดูประวัติการบำรุงรักษาและการล้างถังน้ำ
- **สำหรับผู้ดูแลประปา (Maintenance/Staff):**
  - แผงควบคุม (Dashboard) จัดการคุณภาพน้ำและบันทึกการล้างถัง
  - แจ้งเตือนอัจฉริยะ (Smart Alerts) หากน้ำขุ่นเกินมาตรฐาน หรือเลยกำหนดเวลาล้างถัง
  - รับงานและอัปเดตสถานะข้อร้องเรียนจากชาวบ้าน (รอดำเนินการ -> รับงาน -> กำลังดำเนินการ -> เสร็จงาน)
- **สำหรับผู้ดูแลระบบ (Admin):**
  - แผงควบคุมภาพรวม (Overview Dashboard) เพื่อดูสถานะทุกระบบในที่เดียว
  - ระบบจัดการบุคลากร (Personnel Management) เพิ่ม/แก้ไข/ลบ เจ้าหน้าที่และแอดมิน
  - ระบบแจ้งปัญหา (Bug Report) สำหรับแจ้งปัญหาการใช้งานระบบให้ผู้พัฒนา
- **ประสิทธิภาพและการออกแบบ:**
  - **Single API Route Dashboard:** รวมข้อมูลหลายส่วนไว้ใน Endpoint เดียว (`/api/dashboard`) เพื่อแก้ปัญหา Cold Starts และทำให้เว็บโหลดเร็วกว่าเดิมมาก
  - **UI/UX แบบ Clean & Mobile-First:** ธีมสีขาว-ฟ้า อ่านง่าย สบายตา รองรับหน้าจอมือถือเต็มรูปแบบ
  - **Thai Localization:** แสดงผลวันที่เป็นพุทธศักราช (พ.ศ.) และภาษาไทยโดยสมบูรณ์
  - **PWA Ready:** สามารถติดตั้งลงบนหน้าจอมือถือและทำงานเสมือนแอปพลิเคชัน (Native App)

## 🏗 โครงสร้างโปรเจกต์ (Next.js Serverless)

ระบบได้ถูกย้าย (Migrate) จาก Node.js/Express มาเป็น Next.js API Routes เพื่อให้สามารถรันบน **Vercel** ได้ฟรีและมีประสิทธิภาพสูงสุด

```
lab1/
├── README.md               # เอกสารภาพรวมของโปรเจกต์
├── frontend/               # แอปพลิเคชันหลัก (Next.js)
│   ├── package.json
│   ├── models/             # Mongoose Models (Water, Complaint, Admin, ฯลฯ)
│   ├── pages/              # หน้าเว็บ (index, admin, user, maintenance, personnel, ฯลฯ)
│   ├── pages/api/          # API Routes (Serverless Backend ของระบบ)
│   ├── public/             # ไฟล์รูปภาพ (Logo) และ PWA Manifest
│   ├── styles/             # ไฟล์ CSS (globals.css, Home.module.css)
│   └── utils/              # ไฟล์ตั้งค่าส่วนกลาง เช่น dbConnect.js
```

## 🛠 เทคโนโลยีที่ใช้
- **Framework:** [Next.js (Pages Router)](https://nextjs.org/)
- **Backend/API:** Next.js API Routes (Serverless Functions)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (ผ่าน Mongoose)
- **Deployment:** [Vercel](https://vercel.com/)
- **PWA:** `next-pwa`

## 🚀 การติดตั้งและการรันระบบในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
เปิด Terminal แล้วรันคำสั่งต่อไปนี้:
```bash
cd frontend
npm install
```

### 2. ตั้งค่า Environment Variables (ถ้ามี)
ระบบใช้ฐานข้อมูล MongoDB ในการเชื่อมต่อ โดยค่าเริ่มต้น `dbConnect.js` ได้ถูกตั้งค่า URI หลักไว้แล้ว ทำให้สามารถรันได้ทันทีโดยไม่ต้องตั้งค่า `.env` เพิ่มเติม แต่หากต้องการชี้ไปยัง Database ของตนเอง สามารถสร้างไฟล์ `frontend/.env.local` และกำหนดค่าได้:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster...
```

### 3. รัน Development Server
```bash
npm run dev
```
> ระบบจะรันอยู่ที่ `http://localhost:3000`

## 🌍 การอัปโหลดขึ้นเซิร์ฟเวอร์ (Deployment)

โปรเจกต์นี้ตั้งค่าให้สามารถ Deploy ขึ้น **Vercel** ได้ง่ายๆ เพียงแค่เชื่อมต่อ GitHub Repository กับ Vercel ระบบจะทำการ Build และ Deploy ส่วนของ Frontend และแปลงโฟลเดอร์ `/api` ไปเป็น Serverless Functions ให้โดยอัตโนมัติ

*(หมายเหตุ: ต้องตั้งค่า Network Access ใน MongoDB Atlas ให้เป็น `0.0.0.0/0` (Allow all IP) เพื่อป้องกันปัญหาการเชื่อมต่อ Timeout จากฝั่ง Vercel Serverless)*