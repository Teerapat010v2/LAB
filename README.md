# ระบบจัดการน้ำประปาหมู่บ้าน

โปรเจกต์นี้เป็นระบบสำหรับตรวจสอบคุณภาพน้ำ ประวัติการบำรุงรักษาถังเก็บน้ำ และจัดการเรื่องร้องเรียน โดยออกแบบสถาปัตยกรรมแบบแยกส่วน (Decoupled Architecture) ประกอบด้วย `frontend` และ `backend` เพื่อให้ง่ายต่อการขยายและพัฒนา

## คุณสมบัติหลัก
- **ตรวจสอบคุณภาพน้ำ (Turbidity):** แสดงระดับความขุ่นของน้ำและแจ้งเตือนเมื่อผิดปกติ
- **ระบบบริการประชาชน:** ให้ชาวบ้านดูสถานะน้ำ ติดตามการบำรุงรักษา และส่งเรื่องร้องเรียน
- **ระบบจัดการสำหรับผู้ดูแล (Admin):** จัดการบันทึกการล้างถัง เพิ่มข้อมูลผู้ดูแล และจัดการข้อร้องเรียน
- **UI/UX แบบ Clean & Mobile-First:** ดีไซน์สบายตา เข้าถึงง่าย รองรับการใช้งานผ่านสมาร์ทโฟนเต็มรูปแบบ

## โครงสร้างโปรเจกต์ (Next.js + Node.js/Express)

```
lab1/
├── README.md               # เอกสารภาพรวมของโปรเจกต์
├── design.md               # เอกสารการออกแบบ UI/UX
├── SRS.md                  # เอกสารความต้องการระบบ
├── claude.md               # Guideline ของโปรเจกต์
├── task.md                 # รายการงานและสถานะการพัฒนา
│
├── frontend/               # แอปพลิเคชัน Frontend (Next.js - Pages Router)
│   ├── package.json
│   ├── pages/              # หน้าเว็บทั้งหมด (index, admin, user, ฯลฯ)
│   ├── styles/             # ไฟล์ CSS (globals.css, Home.module.css)
│   ├── public/             # ไฟล์รูปภาพและ assets
│   └── README.MD           # คู่มือของส่วน Frontend
│
└── backend/                # API เซิร์ฟเวอร์ (Node.js/Express)
    ├── package.json
    ├── app.js              # จุดเริ่มต้นของ Backend Server
    ├── routes/             # API Routes (water, maintenance, ฯลฯ)
    ├── models/             # ไฟล์จำลอง Database (Mock data/models)
    ├── services/           # Business Logic ของแต่ละ API
    ├── config/             # การตั้งค่า (CORS, ตัวแปรสภาพแวดล้อม)
    └── swagger.json        # เอกสาร API แบบ OpenAPI
```

## เทคโนโลยีที่ใช้
- **Frontend**: Next.js (Pages Router) ควบคู่กับ Custom CSS (Clean & Minimal Design)
- **Backend**: Node.js พร้อมกับ Express.js
- **API Documentation**: Swagger UI (รันบน Express)
- **การสื่อสาร**: RESTful API ผ่าน JSON

## การติดตั้งและการรันระบบ

การรันโปรเจกต์นี้ต้องเปิด 2 Terminal แยกกันสำหรับ Frontend และ Backend

### 1. รัน Backend (API Server)
เปิด Terminal ใหม่แล้วรันคำสั่งต่อไปนี้:
```bash
cd backend
npm install
npm run dev
```
> Backend จะทำงานที่ `http://localhost:5000`
> สามารถดู API Docs ได้ที่ `http://localhost:5000/api-docs/`

### 2. รัน Frontend (Web UI)
เปิด Terminal ที่สองแล้วรันคำสั่งต่อไปนี้:
```bash
cd frontend
npm install
npm run dev
```
> Frontend จะทำงานที่ `http://localhost:3000`

---
*เอกสารนี้ได้รับการอัปเดตล่าสุดให้สอดคล้องกับโครงสร้างโค้ดปัจจุบัน (Node.js/Express & Next.js Pages Router)*