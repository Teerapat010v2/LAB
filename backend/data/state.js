const { TURBIDITY_THRESHOLD, CLEANING_INTERVAL_DAYS } = require('../config/settings');
const { getStatus } = require('../services/WaterService');
const { daysBetween } = require('../utils/helper');

const waterReading = {
  turbidity: 2.5,
  timestamp: new Date().toISOString(),
};

const admins = [
  { id: 'admin-1', name: 'ผู้ดูแลระบบประปา', phone: '080-123-4567', note: 'ผู้ดูแลหลักของหมู่บ้าน' },
];

const contact = {
  name: 'ผู้ดูแลระบบประปา',
  phone: '080-123-4567',
  note: 'ติดต่อเมื่อมีเหตุฉุกเฉิน',
};

const maintenanceRecords = [
  { id: 'maintenance-1', date: '2026-04-01', reason: 'ล้างถังตามกำหนด', note: 'ล้างถังราย 3 เดือน', createdAt: '2026-04-01T08:00:00.000Z' },
];

const historyRecords = [
  { id: 'history-1', date: '2026-04-01', note: 'ล้างถังน้ำตามกำหนด' },
  { id: 'history-2', date: '2026-01-01', note: 'ล้างถังเพราะค่าความขุ่นสูง' },
];

const complaints = [
  { id: 'complaint-1', name: 'ชาวบ้าน', phone: '081-234-5678', topic: 'น้ำขุ่น', message: 'น้ำที่บ้านขุ่นมากในตอนเช้า', status: 'Open', submittedAt: '2026-07-28T09:15:00.000Z' },
];

const cleaningPlans = [
  { id: 'plan-1', scheduleDate: '2026-08-15', description: 'ตรวจสอบและล้างถังน้ำหลัก', assignedTo: 'ทีมช่างประปา', status: 'Planned' },
];

function getWaterData() {
  const status = getStatus(waterReading.turbidity);
  let message = 'คุณภาพน้ำปกติ';
  if (status === 'Alert') {
    message = 'ค่าความขุ่นเพิ่มขึ้น โปรดติดตามใกล้ชิด';
  } else if (status === 'Critical') {
    message = 'ความขุ่นสูงเกินเกณฑ์ แจ้งผู้ดูแลทันที';
  }

  return {
    turbidity: waterReading.turbidity,
    status,
    level: status === 'Normal' ? 'ปกติ' : status === 'Alert' ? 'เตือน' : 'วิกฤติ',
    threshold: TURBIDITY_THRESHOLD,
    message,
    timestamp: waterReading.timestamp,
  };
}

function getLastCleaningDate() {
  if (maintenanceRecords.length === 0) {
    return null;
  }
  const sorted = [...maintenanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  return new Date(sorted[0].date);
}

function getAlerts() {
  const alerts = [];
  const currentDate = new Date();
  const lastCleaning = getLastCleaningDate();
  const daysSinceCleaning = lastCleaning ? daysBetween(lastCleaning, currentDate) : null;
  const waterData = getWaterData();

  if (lastCleaning) {
    alerts.push({
      type: 'เวลา',
      message: `ล้างถังครั้งล่าสุดเมื่อ ${lastCleaning.toISOString().split('T')[0]} (${daysSinceCleaning} วันที่ผ่านมา)`,
      active: daysSinceCleaning >= CLEANING_INTERVAL_DAYS,
    });
  } else {
    alerts.push({
      type: 'เวลา',
      message: 'ยังไม่พบประวัติการล้างถัง',
      active: true,
    });
  }

  alerts.push({
    type: 'ความขุ่น',
    message: waterData.status === 'Critical'
      ? 'ค่าความขุ่นสูงเกินเกณฑ์ ต้องรีบดำเนินการ'
      : waterData.status === 'Alert'
      ? 'ค่าความขุ่นสูงกว่าปกติ โปรดตรวจสอบ'
      : 'ค่าความขุ่นอยู่ในเกณฑ์ปกติ',
    active: waterData.status !== 'Normal',
  });

  if (complaints.some((item) => item.status === 'Open')) {
    alerts.push({
      type: 'ร้องเรียน',
      message: 'มีการร้องเรียนที่ยังไม่ได้ดำเนินการกรุณาตรวจสอบ',
      active: true,
    });
  }

  return alerts;
}

function updateWaterReading(turbidity) {
  if (typeof turbidity === 'number' && !Number.isNaN(turbidity)) {
    waterReading.turbidity = turbidity;
    waterReading.timestamp = new Date().toISOString();
  }
  return getWaterData();
}

function addMaintenanceRecord(record) {
  const newRecord = {
    id: `maintenance-${Date.now()}`,
    date: record.date || new Date().toISOString().split('T')[0],
    reason: record.reason || 'ล้างถังทั่วไป',
    note: record.note || '',
    createdAt: new Date().toISOString(),
  };
  maintenanceRecords.push(newRecord);
  historyRecords.unshift({
    id: `history-${Date.now()}`,
    date: newRecord.date,
    note: `${newRecord.reason} - ${newRecord.note}`,
  });
  return newRecord;
}

function addAdmin(admin) {
  const newAdmin = {
    id: `admin-${Date.now()}`,
    name: admin.name || 'ไม่ระบุชื่อ',
    phone: admin.phone || '-',
    note: admin.note || '',
  };
  admins.push(newAdmin);
  return [...admins];
}

function getAdmins() {
  return admins.map((admin) => ({ ...admin }));
}

function getContact() {
  return { ...contact };
}

function updateContact(updated) {
  if (updated && typeof updated === 'object') {
    contact.name = updated.name || contact.name;
    contact.phone = updated.phone || contact.phone;
    contact.note = typeof updated.note === 'string' ? updated.note : contact.note;
  }
  return getContact();
}

function getComplaints() {
  return complaints.map((item) => ({ ...item }));
}

function addComplaint(entry) {
  const newComplaint = {
    id: `complaint-${Date.now()}`,
    name: entry.name || 'ไม่ระบุชื่อ',
    phone: entry.phone || '-',
    topic: entry.topic || 'ร้องเรียนทั่วไป',
    message: entry.message || '',
    status: 'Open',
    submittedAt: new Date().toISOString(),
  };
  complaints.unshift(newComplaint);
  return newComplaint;
}

function updateComplaintStatus(id, status) {
  const complaint = complaints.find((item) => item.id === id);
  if (complaint) {
    complaint.status = status;
  }
  return complaint;
}

function getCleaningPlans() {
  return cleaningPlans.map((plan) => ({ ...plan }));
}

function addCleaningPlan(plan) {
  const newPlan = {
    id: `plan-${Date.now()}`,
    scheduleDate: plan.scheduleDate || new Date().toISOString().split('T')[0],
    description: plan.description || 'แผนการล้างถัง',
    assignedTo: plan.assignedTo || 'ทีมช่าง',
    status: 'Planned',
  };
  cleaningPlans.unshift(newPlan);
  return newPlan;
}

module.exports = {
  getWaterData,
  getAlerts,
  updateWaterReading,
  getAdmins,
  addAdmin,
  getContact,
  updateContact,
  getMaintenanceRecords: () => [...maintenanceRecords],
  addMaintenanceRecord,
  getHistoryRecords: () => [...historyRecords],
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  getCleaningPlans,
  addCleaningPlan,
};
