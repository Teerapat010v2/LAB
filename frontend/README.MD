# README สำหรับ Frontend

## ภาพรวม
- ส่วน frontend เชื่อมต่อกับ backend ผ่าน API
- ออกแบบส่วนติดต่อผู้ใช้โดยเน้นมือถือเป็นหลัก
- ใช้ template Material Design 3 จาก https://m3.material.io/ (เวอร์ชันฟรี)
- ใช้เฟรมเวิร์ก: Next.js

## Swagger / OpenAPI
ใช้งาน Swagger/OpenAPI เพื่อจัดทำเอกสาร API ของแบ็กเอนด์

### ดูเอกสาร API
- เริ่มต้นเซิร์ฟเวอร์ backend ก่อน
- เปิด Swagger UI ในเบราว์เซอร์ที่:
  - `http://localhost:5000/api/docs`

> หาก backend ใช้พอร์ตอื่น ให้แทนที่ `5000` ด้วยค่าของ `PORT` ที่ตั้งค่าไว้

### Swagger editor
สามารถเปิดโค้ด OpenAPI ใน Swagger online editor ได้ที่:
- https://editor.swagger.io/

คัดลอก OpenAPI ตัวอย่างด้านล่างไปวางใน Swagger editor เพื่อดูรายละเอียด API:

```yaml
openapi: 3.0.0
info:
  title: ระบบจัดการน้ำประปาหมู่บ้าน
  version: 1.0.0
  description: API สำหรับติดตามความขุ่นของน้ำ การแจ้งเตือน การบำรุงรักษา และประวัติการล้างถัง
servers:
  - url: http://localhost:5000
paths:
  /api/water:
    get:
      summary: ดึงข้อมูลน้ำปัจจุบัน
      responses:
        '200':
          description: คืนค่าความขุ่นและสถานะปัจจุบัน
          content:
            application/json:
              example:
                turbidity: 2.5
                status: Normal
    post:
      summary: บันทึกข้อมูลน้ำ
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: บันทึกข้อมูลน้ำเรียบร้อยแล้ว
  /api/maintenance:
    get:
      summary: ดึงบันทึกการบำรุงรักษา
      responses:
        '200':
          description: รายการบันทึกการบำรุงรักษา
    post:
      summary: เพิ่มบันทึกการล้างถัง
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว
  /api/history:
    get:
      summary: ดึงประวัติการล้างถัง
      responses:
        '200':
          description: รายการประวัติการล้างถัง
  /api/alert:
    get:
      summary: ดึงการแจ้งเตือนปัจจุบัน
      responses:
        '200':
          description: รายการการแจ้งเตือน
```

## หมายเหตุ
- ส่วน frontend ควรเรียกใช้ API ของ backend ผ่านเส้นทาง `/api/water`, `/api/maintenance`, `/api/history`, และ `/api/alert`
- หาก backend ยังไม่มี Swagger UI ให้ใช้ Swagger editor พร้อม OpenAPI ตัวอย่างด้านบนเพื่อบันทึกและทดสอบ API

