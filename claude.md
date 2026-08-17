# Claude Development Guide
## ระบบจัดการนำ้ประปาหมู่บ้าน (Village Water Management System)

---

## 📋 Project Overview

### Objective
พัฒนาแอพเว็บสำหรับดูแลและจัดการระบบนำ้ประปาของหมู่บ้าน โดยเน้นการติดตามคุณภาพนำ้และการบำรุงรักษาถังเก็บนำ้

### Key Focus Areas
- ✅ Turbidity Monitoring (วัดระดับความขุ่น)
- ✅ Automated Alerts (แจ้งเตือนอัตโนมัติ)
- ✅ Cleaning History Tracking (ประวัติการล้างถัง)
- ✅ Mobile & Desktop Responsive Design

---

## 🎯 Core Requirements

### Functional Requirements

| # | ฟีเจอร์ | รายละเอียด | Priority |
|---|--------|----------|----------|
| 1 | Turbidity Monitoring | วัดและแสดงค่าความขุ่นแบบ Real-time | 🔴 HIGH |
| 2 | Cleaning Alerts | แจ้งเตือนเมื่อถึง 3 เดือน หรือความขุ่นสูง | 🔴 HIGH |
| 3 | Cleaning History | บันทึกและแสดงประวัติการล้างถัง | 🟡 MEDIUM |
| 4 | Tank Management | บันทึกการล้างถังพร้อมวันที่และเหตุผล | 🔴 HIGH |

### Non-Functional Requirements

- **Responsive Design**: ใช้งานได้บนมือถือและ PC
- **Real-time Performance**: แสดงข้อมูลความขุ่นแบบ Real-time
- **Architecture**: Frontend + Backend (Separated)
- **Data Persistence**: บันทึกข้อมูลอย่างเชื่อถือได้

---

## 🏗️ Technical Stack

### Frontend
```
- Framework: React / Vue / Angular (ยังไม่กำหนด)
- Design: Responsive Web Design
- Compatibility: Cross-browser
- UI Components: Mobile-first approach
```

### Backend
```
- API: RESTful API หรือ GraphQL
- Database: SQL/NoSQL (ยังไม่กำหนด)
- Authentication: Required (if multi-user)
- Real-time: WebSocket / Polling for sensor data
```

### Database Schema

#### 1. Tank Cleaning Record Table
```
- id (PK)
- cleaning_date
- cleaning_time
- reason (Scheduled / High Turbidity)
- notes
- user_id
- created_at
- updated_at
```

#### 2. Turbidity Reading Table
```
- id (PK)
- value (turbidity level)
- timestamp
- status (Normal / Alert / Critical)
- sensor_id
- created_at
```

#### 3. Alert Log Table
```
- id (PK)
- alert_type (Scheduled / Turbidity)
- triggered_date
- triggered_time
- status (Active / Resolved)
- acknowledged_by (user_id)
- acknowledged_at
```

---

## 📊 User Stories & Acceptance Criteria

### US-1: Monitor Water Quality
```
As a: ผู้ดูแลระบบนำ้
I want: ดูระดับความขุ่นปัจจุบัน
So that: ฉันสามารถตรวจสอบคุณภาพนำ้

Acceptance Criteria:
✅ แสดงค่าความขุ่นแบบ Real-time บนหน้าจอ
✅ มีตัวบ่งชี้สถานะ (Normal/Alert/Critical)
✅ อัปเดตข้อมูลทุก X วินาที
```

### US-2: Receive Alerts
```
As a: ผู้ดูแลระบบนำ้
I want: รับการแจ้งเตือนเมื่อต้องล้างถัง
So that: ฉันสามารถบำรุงรักษาระบบได้ตรงเวลา

Acceptance Criteria:
✅ แจ้งเตือนเมื่อถึง 3 เดือนจากล้างครั้งสุดท้าย
✅ แจ้งเตือนเมื่อความขุ่น > threshold
✅ การแจ้งเตือนต้องชัดเจนบนหน้าจอ
✅ มีตัวเลือก Acknowledge Alert
```

### US-3: Record Tank Cleaning
```
As a: ผู้ดูแลระบบนำ้
I want: บันทึกเมื่อมีการล้างถัง
So that: ฉันสามารถติดตามประวัติการบำรุงรักษา

Acceptance Criteria:
✅ มีฟอร์มบันทึกการล้างถัง
✅ บันทึกวันที่ เวลา และเหตุผล
✅ มีช่องสำหรับหมายเหตุ
✅ สามารถส่งฟอร์มได้สำเร็จ
```

### US-4: View Cleaning History
```
As a: ผู้ดูแลระบบนำ้
I want: ดูประวัติการล้างถังแบบรายการ
So that: ฉันสามารถระบุรูปแบบการบำรุงรักษา

Acceptance Criteria:
✅ แสดงรายการประวัติการล้างทั้งหมด
✅ มีตัวกรอง (Filter) ตามวันที่
✅ มีค้นหา (Search) ตามเหตุผล
✅ แสดง User ที่ทำการล้าง
```

---

## 🔄 Business Logic

### Alert Triggering Logic

```
1. Time-based Alert (ปกติ):
   - Last cleaning date: YYYY-MM-DD
   - Today's date - Last cleaning date >= 90 days
   → Trigger Alert: "เวลาล้างถังแล้ว"

2. Turbidity-based Alert:
   - Current turbidity value > THRESHOLD
   → Trigger Alert: "ความขุ่นสูงเกินไป ต้องล้างถังด่วน"

3. Alert Duration:
   - Alert stays active until:
     a) User acknowledges it, OR
     b) New cleaning record is created
```

### Cleaning Record Reset Logic

```
After successful cleaning record:
1. Set: last_cleaning_date = current_date
2. Set: last_cleaning_time = current_time
3. Clear: Time-based alert (if active)
4. Reset: 90-day countdown timer
5. Create: History log entry
```

---

## 🎨 UI/UX Key Components

### Dashboard
- [ ] Real-time Turbidity Display (Large Card)
- [ ] Alert Status Indicator
- [ ] Last Cleaning Date/Time
- [ ] Quick Action Button: "Record Cleaning"
- [ ] History Summary

### Cleaning History Page
- [ ] Table/List of all cleaning records
- [ ] Filters: Date Range, Reason Type
- [ ] Search Box
- [ ] Export to CSV (Optional)
- [ ] Pagination

### Alert System
- [ ] Banner/Toast Notification
- [ ] Modal for Alert Details
- [ ] Acknowledge Button
- [ ] Dismiss Button

### Mobile Responsiveness
- [ ] Stack layout on small screens
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Collapsible menu
- [ ] Readable font sizes

---

## 📱 Device Compatibility

| Device | Browser | Support |
|--------|---------|---------|
| Mobile | Chrome | ✅ |
| Mobile | Safari | ✅ |
| Mobile | Firefox | ✅ |
| Tablet | All | ✅ |
| Desktop | Chrome | ✅ |
| Desktop | Firefox | ✅ |
| Desktop | Safari | ✅ |
| Desktop | Edge | ✅ |

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project setup (Frontend + Backend)
- [x] Database design & implementation (Mocked)
- [x] API endpoints (CRUD operations)
- [x] Basic UI layout

### Phase 2: Core Features (Week 3-4)
- [x] Turbidity monitoring integration
- [x] Alert system implementation
- [x] Cleaning record functionality
- [x] History view

### Phase 3: Polish & Testing (Week 5-6)
- [x] Responsive design refinement (Mobile-first, Clean UI)
- [x] Bug fixes and optimizations
- [ ] Unit & Integration testing
- [ ] User acceptance testing

### Phase 4: Deployment (Week 7)
- [ ] Production deployment
- [x] Documentation (Updated MD files)
- [ ] Training & Handover

---

## 🛠️ Development Guidelines for Claude

### When Writing Code:
1. **Frontend Code**
   - Use component-based architecture
   - Implement proper error handling
   - Add loading states for async operations
   - Make responsive design first priority

2. **Backend Code**
   - Use RESTful conventions
   - Validate all inputs
   - Implement proper error responses
   - Add logging for debugging

3. **Database Code**
   - Use proper indexes
   - Implement transaction handling
   - Add data validation constraints
   - Plan for data archiving

### Code Quality Standards:
- ✅ Clean, readable code with comments
- ✅ Follow naming conventions
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Proper error handling
- ✅ Logging for debugging

### Testing:
- ✅ Unit tests for business logic
- ✅ Integration tests for API
- ✅ UI testing for user interactions

---

## 📞 Key Contact Points

### Configuration Parameters
- **Cleaning Interval**: 90 days (3 months)
- **Turbidity Threshold**: TBD (to be defined)
- **Real-time Update Frequency**: Every 30 seconds (TBD)
- **Alert Persistence**: Until acknowledged or resolved

### Integration Points
- **Turbidity Sensor**: API/Serial connection (TBD)
- **Notification Service**: Email/SMS (Optional)
- **Authentication**: AD/OAuth (Optional)

---

## 📝 Notes & Assumptions

### Assumptions
- ✅ Turbidity sensor is properly calibrated
- ✅ Sensor data API is available
- ✅ User can manually record cleaning
- ✅ System operates 24/7

### Constraints
- ⚠️ Real-time data must be reliable
- ⚠️ System must handle multiple users
- ⚠️ Data must be accessible offline (cache)
- ⚠️ Mobile bandwidth may be limited

---

*Document Version: 1.0*
*Created: 2026-06-24*
*Status: Ready for Development*
