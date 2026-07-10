# ระบบจัดการน้ำประปาหมู่บ้าน

โปรเจกต์นี้เป็นระบบต้นแบบสำหรับตรวจสอบคุณภาพน้ำ ประวัติการล้างถัง และแจ้งเตือนการบำรุงรักษา โดยแยกเป็นส่วน `frontend` (UI) และ `backend` (API/บริการ) เพื่อให้ง่ายต่อการพัฒนาและขยาย

## คุณสมบัติหลัก
- วัดระดับความขุ่นของน้ำ
- แจ้งเตือนเมื่อถึงกำหนดหรือตรวจพบความขุ่นสูง
- บันทึกประวัติการล้างถังและงานซ่อมบำรุง
- รองรับการใช้งานบนมือถือและเดสก์ท็อป

## โครงสร้างโปรเจกต์ (Next.js + Backend)

```
lab1/
├── README.md
├── architecture.md
├── SRS.md
├── claude.md
├── .gitignore              # ไฟล์ที่ไม่ upload ไปยัง Git
├── .env.local              # ตัวแปรสภาพแวดล้อม (ท้องถิ่น)
│
├── frontend/               # แอป Next.js (React)
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js      # การตั้งค่า Next.js
│   ├── tailwind.config.js  # การตั้งค่า Tailwind (ถ้าใช้)
│   ├── postcss.config.js
│   ├── .env.local          # ตัวแปรสภาพแวดล้อม (local)
│   │
│   ├── public/             # รูปภาพและไฟล์สาธารณะ
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/            # App Router (Next.js 13+)
│   │   │   ├── layout.js
│   │   │   ├── page.js     # หน้าแรก
│   │   │   ├── dashboard/
│   │   │   │   └── page.js
│   │   │   └── api/        # Backend Routes ใน Next.js
│   │   │       ├── water/
│   │   │       │   └── route.js
│   │   │       ├── maintenance/
│   │   │       │   └── route.js
│   │   │       └── history/
│   │   │           └── route.js
│   │   │
│   │   ├── components/     # React Components
│   │   │   ├── Header.js
│   │   │   ├── WaterStatus.js
│   │   │   ├── MaintenanceLog.js
│   │   │   └── Alert.js
│   │   │
│   │   ├── lib/            # Utility Functions
│   │   │   ├── api-client.js      # ฟังก์ชัน fetch API
│   │   │   ├── db.js              # การเชื่อมต่อ Database
│   │   │   └── constants.js
│   │   │
│   │   ├── styles/         # CSS Modules / Global Styles
│   │   │   ├── globals.css
│   │   │   └── Home.module.css
│   │   │
│   │   └── hooks/          # Custom React Hooks
│   │       └── useWaterData.js
│   │
│   └── node_modules/
│
└── backend/                # บริการหลังบ้าน (Optional - สำหรับ External API)
    ├── app.py              # จุดเริ่มต้น Flask/FastAPI
    ├── requirements.txt    # รายการไลบรารี Python
    ├── .env                # ตัวแปรสภาพแวดล้อม
    │
    ├── routes/
    │   ├── __init__.py
    │   ├── water.py        # API สำหรับน้ำ
    │   ├── maintenance.py  # API สำหรับบำรุงรักษา
    │   └── history.py      # API สำหรับประวัติ
    │
    ├── models/
    │   ├── __init__.py
    │   ├── water_model.py
    │   ├── maintenance_model.py
    │   └── database.py
    │
    ├── services/
    │   ├── __init__.py
    │   ├── water_service.py
    │   └── alert_service.py
    │
    └── config/
        └── settings.py
```

หมายเหตุ: 
- โครงสร้างนี้ใช้ **Next.js 13+ (App Router)** 
- API routes ใน `frontend/src/app/api/` ใช้เป็น backend
- Backend folder สำหรับ external API (ถ้าต้องการแยก)

## เทคโนโลยีที่ใช้
- **Frontend**: Next.js 13+ (React, App Router) — SSR/SSG, API routes, TypeScript support
- **Styling**: Tailwind CSS หรือ CSS Modules
- **Backend** (Optional): FastAPI / Flask (Python) หรือ Express (Node.js) — สำหรับ external API/database
- **Database**: PostgreSQL / MongoDB / Supabase
- **Deployment**: Vercel (Next.js), Railway หรือ Heroku (backend)

## ขั้นตอนเริ่มต้นสำหรับ Next.js

### 1. สร้างโปรเจกต์ Next.js ใหม่

```bash
cd lab1
npx create-next-app@latest frontend --typescript --tailwind
cd frontend
npm install
```

### 2. โครงสร้างไฟล์เริ่มต้น

หลังจากสร้าง project แล้ว Next.js จะสร้างโครงสร้างดังนี้:

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx      # Layout หลัก
│       ├── page.tsx        # หน้าแรก (/)
│       └── api/            # API Routes (route handlers)
├── public/
├── package.json
├── next.config.js
└── tsconfig.json
```

### 3. สร้าง API Routes สำหรับ Backend

สร้างไฟล์ `src/app/api/water/route.ts`:

```typescript
// src/app/api/water/route.ts
export async function GET(request: Request) {
  // ดึงข้อมูลจาก database หรือ external API
  return Response.json({
    turbidity: 2.5,
    status: 'ปกติ',
    lastUpdated: new Date(),
  });
}

export async function POST(request: Request) {
  // บันทึกข้อมูลใหม่
  const data = await request.json();
  // save to database
  return Response.json({ success: true });
}
```

### 4. สร้าง Components

```typescript
// src/components/WaterStatus.tsx
'use client';

import { useEffect, useState } from 'react';

export default function WaterStatus() {
  const [water, setWater] = useState(null);

  useEffect(() => {
    fetch('/api/water')
      .then((res) => res.json())
      .then((data) => setWater(data));
  }, []);

  return (
    <div>
      <h2>สถานะน้ำ</h2>
      {water && <p>ความขุ่น: {water.turbidity}</p>}
    </div>
  );
}
```

### 5. รันโหมดพัฒนา

```bash
npm run dev
# เปิด http://localhost:3000
```

### 6. คำสั่งที่ใช้บ่อย

```bash
npm run dev      # พัฒนา (development)
npm run build    # สร้างไฟล์ production
npm run start    # รัน production build
npm run lint     # ตรวจสอบ code
```

## การเชื่อมต่อ Frontend - Backend

### ตัวเลือก 1: ใช้ Next.js API Routes (แนะนำ)

Next.js API Routes ทำหน้าที่เป็น backend โดยตรง:

```typescript
// frontend/src/app/api/water/route.ts
import { connectDB } from '@/lib/db';

export async function GET() {
  const db = await connectDB();
  const water = await db.query('SELECT * FROM water_status ORDER BY id DESC LIMIT 1');
  return Response.json(water[0]);
}
```

เรียกจาก Client Components:

```typescript
const response = await fetch('/api/water');
const data = await response.json();
```

### ตัวเลือก 2: Backend แยก (Python/Express)

ถ้าต้องการ backend แยกออกมา:

1. รัน backend: `python backend/app.py` (ทำงานที่ port 5000)
2. ตั้งค่า CORS ใน `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. เรียก API ใน Next.js:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/water`);
```

### สร้าง Utility สำหรับ API Calls

```typescript
// src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = {
  async getWaterStatus() {
    const res = await fetch(`${API_URL}/water`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  async logMaintenance(data: any) {
    const res = await fetch(`${API_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

## การพัฒนาและทดสอบ

### ตัวเลือก 1: ใช้ Next.js API Routes เท่านั้น

```bash
# Terminal เดียวเพียงพอ
cd frontend
npm run dev
# เปิด http://localhost:3000
```

### ตัวเลือก 2: Backend แยก (ถ้าใช้ Python/Express)

```bash
# Terminal 1: Backend
cd backend
python app.py          # ทำงานที่ http://localhost:5000
# หรือ node server.js

# Terminal 2: Frontend
cd frontend
npm run dev            # ทำงานที่ http://localhost:3000
```

### ไฟล์ `.env.local` (ตัวอย่าง)

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ระบบจัดการน้ำประปา

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/water_management
```

### .gitignore

```
node_modules/
.next/
.env
.env.local
*.pyc
__pycache__/
.DS_Store
```

## ขั้นตอนต่อไป

1. **สร้าง frontend scaffold**:
   ```bash
   cd lab1
   npx create-next-app@latest frontend --typescript --tailwind
   ```

2. **ตั้งค่า Database** (เลือกหนึ่ง):
   - **Supabase** (PostgreSQL): `npm install @supabase/supabase-js`
   - **Firebase**: `npm install firebase`
   - **MongoDB + Mongoose**: `npm install mongoose`

3. **สร้าง API Routes** สำหรับ:
   - `GET/POST /api/water` - ข้อมูลน้ำ
   - `GET/POST /api/maintenance` - บันทึกบำรุงรักษา
   - `GET /api/history` - ประวัติการใช้งาน

4. **สร้าง Components** หลัก:
   - Dashboard
   - Water Status Card
   - Maintenance Log
   - Alert System

5. **Deploy**:
   - Frontend ไป **Vercel**: `vercel deploy`
   - Backend ไป **Railway/Heroku** (ถ้ามี)

---

## ทรัพยากร
- [Next.js Documentation](https://nextjs.org/docs)
- [API Routes Guide](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)
#   L A B  
 #   L A B  
 