const { TURBIDITY_THRESHOLD, CLEANING_INTERVAL_DAYS } = require('../config/settings');
const { getStatus } = require('../services/WaterService');
const { daysBetween } = require('../utils/helper');

const Water = require('../models/WaterModel');
const Maintenance = require('../models/MaintenanceModel');
const Admin = require('../models/AdminModel');
const Complaint = require('../models/ComplaintModel');
const Plan = require('../models/PlanModel');
const History = require('../models/HistoryModel');

// Some static state that doesn't need DB or can be migrated later if needed
let contact = {
  name: 'ผู้ดูแลระบบประปา',
  phone: '080-123-4567',
  note: 'ติดต่อเมื่อมีเหตุฉุกเฉิน',
};

async function getWaterData() {
  let waterReading = await Water.findOne().sort({ timestamp: -1 });
  if (!waterReading) {
    waterReading = await Water.create({ turbidity: 2.5 });
  }

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

async function getLastCleaningDate() {
  const latestMaintenance = await Maintenance.findOne().sort({ date: -1 });
  if (!latestMaintenance) {
    return null;
  }
  return new Date(latestMaintenance.date);
}

async function getAlerts() {
  const alerts = [];
  const currentDate = new Date();
  const lastCleaning = await getLastCleaningDate();
  const daysSinceCleaning = lastCleaning ? daysBetween(lastCleaning, currentDate) : null;
  const waterData = await getWaterData();

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

  const openComplaintsCount = await Complaint.countDocuments({ status: 'Open' });
  if (openComplaintsCount > 0) {
    alerts.push({
      type: 'ร้องเรียน',
      message: 'มีการร้องเรียนที่ยังไม่ได้ดำเนินการกรุณาตรวจสอบ',
      active: true,
    });
  }

  return alerts;
}

async function updateWaterReading(turbidity) {
  if (typeof turbidity === 'number' && !Number.isNaN(turbidity)) {
    await Water.create({ turbidity });
  }
  return await getWaterData();
}

async function addMaintenanceRecord(record) {
  const dateStr = record.date || new Date().toISOString().split('T')[0];
  const newRecord = await Maintenance.create({
    date: dateStr,
    reason: record.reason || 'ล้างถังทั่วไป',
    note: record.note || '',
  });

  await History.create({
    date: dateStr,
    note: `${newRecord.reason} - ${newRecord.note}`,
  });

  return newRecord;
}

async function getMaintenanceRecords() {
  return await Maintenance.find().sort({ date: -1 });
}

async function getHistoryRecords() {
  return await History.find().sort({ date: -1 });
}

async function addAdmin(admin) {
  await Admin.create({
    name: admin.name || 'ไม่ระบุชื่อ',
    phone: admin.phone || '-',
    note: admin.note || '',
  });
  return await getAdmins();
}

async function getAdmins() {
  return await Admin.find();
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

async function getComplaints() {
  return await Complaint.find().sort({ submittedAt: -1 });
}

async function addComplaint(entry) {
  const newComplaint = await Complaint.create({
    name: entry.name || 'ไม่ระบุชื่อ',
    phone: entry.phone || '-',
    topic: entry.topic || 'ร้องเรียนทั่วไป',
    message: entry.message || '',
  });
  return newComplaint;
}

async function updateComplaintStatus(id, status) {
  const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true });
  return complaint;
}

async function getCleaningPlans() {
  return await Plan.find().sort({ scheduleDate: -1 });
}

async function addCleaningPlan(plan) {
  const newPlan = await Plan.create({
    scheduleDate: plan.scheduleDate || new Date().toISOString().split('T')[0],
    description: plan.description || 'แผนการล้างถัง',
    assignedTo: plan.assignedTo || 'ทีมช่าง',
  });
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
  getMaintenanceRecords,
  addMaintenanceRecord,
  getHistoryRecords,
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  getCleaningPlans,
  addCleaningPlan,
};
