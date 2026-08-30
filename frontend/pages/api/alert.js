import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';
import Maintenance from '../../models/MaintenanceModel';
import Complaint from '../../models/ComplaintModel';

const TURBIDITY_THRESHOLD = 5.0;
const CLEANING_INTERVAL_DAYS = 90;

function daysBetween(d1, d2) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatus(turbidity) {
  if (turbidity >= TURBIDITY_THRESHOLD * 2) return 'Critical';
  if (turbidity >= TURBIDITY_THRESHOLD) return 'Alert';
  return 'Normal';
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const alerts = [];
      const currentDate = new Date();
      
      const latestMaintenance = await Maintenance.findOne().sort({ date: -1 });
      const lastCleaning = latestMaintenance ? new Date(latestMaintenance.date) : null;
      const daysSinceCleaning = lastCleaning ? daysBetween(lastCleaning, currentDate) : null;

      let waterReading = await Water.findOne().sort({ timestamp: -1 });
      if (!waterReading) {
        waterReading = await Water.create({ turbidity: 2.5 });
      }
      const waterStatus = getStatus(waterReading.turbidity);

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
        message: waterStatus === 'Critical'
          ? 'ค่าความขุ่นสูงเกินเกณฑ์ ต้องรีบดำเนินการ'
          : waterStatus === 'Alert'
          ? 'ค่าความขุ่นสูงกว่าปกติ โปรดตรวจสอบ'
          : 'ค่าความขุ่นอยู่ในเกณฑ์ปกติ',
        active: waterStatus !== 'Normal',
      });

      const openComplaintsCount = await Complaint.countDocuments({ status: 'Open' });
      if (openComplaintsCount > 0) {
        alerts.push({
          type: 'ร้องเรียน',
          message: 'มีการร้องเรียนที่ยังไม่ได้ดำเนินการกรุณาตรวจสอบ',
          active: true,
        });
      }

      // We'll hardcode contact info in this API just like state.js did, but allow updates via another endpoint?
      // Wait, state.js had an in-memory contact object. Since API routes are serverless, we should fetch from DB, or just return static for now.
      const contact = {
        name: 'ผู้ดูแลระบบประปา',
        phone: '080-123-4567',
        note: 'ติดต่อเมื่อมีเหตุฉุกเฉิน',
      };

      res.status(200).json({ alerts, contact });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
