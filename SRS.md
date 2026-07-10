# Software Requirements Specification (SRS)
## ระบบจัดการนำ้ประปาหมู่บ้าน
### Village Water Management System

---

## 1. บทนำ (Introduction)
ระบบนี้ออกแบบเพื่อดูแลและจัดการระบบนำ้ประปาของหมู่บ้าน โดยมีเป้าหมายให้สามารถติดตามสภาพและประวัติการบำรุงรักษาถังเก็บนำ้

---

## 2. ขอบเขตของระบบ (Scope)

### 2.1 Functional Requirements (ความต้องการเชิงการทำงาน)

1. **วัดระดับความขุ่น (Turbidity Monitoring)**
   - ระบบต้องสามารถวัดและบันทึกระดับความขุ่นของนำ้ในถังเก็บนำ้
   - แสดงค่าความขุ่นแบบเรียลไทม์ (Real-time display)

2. **แจ้งเตือนการล้างถัง (Cleaning Alert System)**
   - แจ้งเตือนเมื่อเกิดสถานการณ์ต่อไปนี้:
     - ถึงครบ 3 เดือนนับจากการล้างครั้งสุดท้าย
     - ระดับความขุ่นสูงเกินไป (ต้องกำหนดค่า threshold)
   - การแจ้งเตือนต้องสามารถมองเห็นได้ชัดเจนบนอินเตอร์เฟส

3. **ประวัติการล้างถัง (Cleaning History)**
   - บันทึกทุกครั้งที่มีการล้างถังเก็บนำ้
   - แสดงวันที่ เวลา และบันทึกรายละเอียด
   - ให้สามารถค้นหาและดูประวัติหรือต่างๆ

4. **การจัดการการล้างถัง (Tank Cleaning Management)**
   - บันทึกการล้างถังโดยระบุวันที่และเหตุผล (ปกติหรือเพราะความขุ่นสูง)
   - ล้างตั้งค่า countdown หลังจากการล้างถัง

### 2.2 Non-Functional Requirements (ความต้องการที่ไม่ใช่เชิงการทำงาน)

1. **ความเข้ากันได้ (Compatibility)**
   - ต้องใช้งานได้บนอุปกรณ์มือถือ (Mobile)
   - ต้องใช้งานได้บนคอมพิวเตอร์ (PC/Desktop)
   - ใช้เว็บ frontend เพื่อ responsive design

2. **สถาปัตยกรรม (Architecture)**
   - มี Frontend: สำหรับแสดงผลและจัดการอินเตอร์เฟส
   - มี Backend: สำหรับจัดการข้อมูลและธุรกิจลอจิก
   - ต้องสามารถจัดเก็บและเรียกดึงข้อมูลได้อย่างเชื่อถือได้

3. **ประสิทธิภาพ (Performance)**
   - การแสดงค่าความขุ่นต้องเป็นไปในเวลาจริง (Real-time)
   - ระบบต้องตอบสนองได้อย่างรวดเร็ว

---

## 3. ฟีเจอร์หลัก (Main Features)

| ลำดับ | ฟีเจอร์ | รายละเอียด |
|------|--------|---------|
| 1 | Turbidity Monitoring | วัดและแสดงระดับความขุ่นแบบ Real-time |
| 2 | Cleaning Alerts | แจ้งเตือนตามกำหนดเวลาหรือสถานะความขุ่น |
| 3 | Cleaning History | ประวัติการล้างถังและรายละเอียด |
| 4 | Mobile-Friendly | ใช้งานได้บนทั้ง Mobile และ Desktop |
| 5 | Backend API | API สำหรับจัดการข้อมูล |

---

## 4. ข้อกำหนดทางเทคนิค (Technical Requirements)

### 4.1 Frontend
- Responsive Web Design
- Cross-browser compatibility
- Framework ที่เหมาะสม (React, Vue, Angular ฯลฯ)

### 4.2 Backend
- RESTful API หรือ GraphQL
- Database สำหรับจัดเก็บข้อมูล
- Authentication/Authorization (ถ้าจำเป็น)

### 4.3 Database
- ตารางสำหรับบันทึกค่าความขุ่น
- ตารางสำหรับประวัติการล้างถัง
- ตารางสำหรับการแจ้งเตือน

---

## 5. User Stories

### User Story 1: ดูระดับความขุ่นปัจจุบัน
**As a** ผู้ดูแลระบบนำ้
**I want** ดูระดับความขุ่นปัจจุบัน
**So that** ฉันสามารถตรวจสอบคุณภาพนำ้

### User Story 2: รับการแจ้งเตือน
**As a** ผู้ดูแลระบบนำ้
**I want** รับการแจ้งเตือนเมื่อต้องล้างถัง
**So that** ฉันสามารถบำรุงรักษาระบบได้ตรงเวลา

### User Story 3: บันทึกการล้างถัง
**As a** ผู้ดูแลระบบนำ้
**I want** บันทึกเมื่อมีการล้างถัง
**So that** ฉันสามารถติดตามประวัติการบำรุงรักษา

### User Story 4: ดูประวัติการล้างถัง
**As a** ผู้ดูแลระบบนำ้
**I want** ดูประวัติการล้างถังแบบรายการ
**So that** ฉันสามารถระบุรูปแบบการบำรุงรักษา

---

## 6. เงื่อนไขการใช้งาน (Acceptance Criteria)

1. ✅ ระบบสามารถแสดงค่าความขุ่นแบบ Real-time
2. ✅ ระบบแจ้งเตือนเมื่อถึง 3 เดือนจากการล้างครั้งสุดท้าย
3. ✅ ระบบแจ้งเตือนเมื่อความขุ่นสูงเกินค่า threshold
4. ✅ สามารถบันทึกการล้างถังพร้อมวันที่และเวลา
5. ✅ สามารถดูประวัติการล้างถังทั้งหมด
6. ✅ ใช้งานได้บนมือถือและ PC

---

## 7. ข้อมูลที่ต้องเก็บ (Data Requirements)

### Tank Cleaning Record
- ID (Primary Key)
- Cleaning Date/Time
- Reason (Scheduled/High Turbidity)
- Notes/Comments
- User ID (ผู้บันทึก)

### Turbidity Reading
- ID (Primary Key)
- Value (ค่าความขุ่น)
- Timestamp
- Status (Normal/Alert/Critical)

### Alert Log
- ID (Primary Key)
- Alert Type (Scheduled/Turbidity)
- Date/Time
- Status (Active/Resolved)

---

## 8. Assumptions & Constraints

### Assumptions
- มีอุปกรณ์วัดความขุ่น (Turbidity Sensor) เชื่อมต่อกับระบบ
- มีการเก็บข้อมูลทั้งหมด

### Constraints
- ต้องแสดงผลแบบ Real-time
- ต้องรองรับหลายผู้ใช้

---

## 9. กำหนดการ (Timeline)

*ระบุตามความเหมาะสมของโครงการ*

---

## 10. ลายนามและการอนุมัติ (Sign-off)

| บทบาท | ชื่อ | ลงนาม | วันที่ |
|-----|-----|------|------|
| Product Owner | - | - | - |
| Project Manager | - | - | - |
| Development Lead | - | - | - |

---

*Document Version: 1.0*
*Last Updated: 2026-06-24*

