import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';
import Bug from '../../models/BugModel';
import Maintenance from '../../models/MaintenanceModel';
import Plan from '../../models/PlanModel';
import Admin from '../../models/AdminModel';
import History from '../../models/HistoryModel';
import Complaint from '../../models/ComplaintModel';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const [water, bugs, maintenance, plans, admins, history, complaints] = await Promise.all([
      Water.findOne().sort({ timestamp: -1 }).lean(),
      Bug.find().sort({ submittedAt: -1 }).lean(),
      Maintenance.find().sort({ date: -1 }).lean(),
      Plan.find().sort({ scheduleDate: 1 }).lean(),
      Admin.find().lean(),
      History.find().sort({ date: -1 }).lean(),
      Complaint.find().sort({ submittedAt: -1 }).lean()
    ]);
    
    const contact = {
      name: 'ผู้ดูแลระบบประปา',
      phone: '080-123-4567',
      note: 'ติดต่อเมื่อมีเหตุฉุกเฉิน',
    };

    const alerts = [];
    const currentDate = new Date();
    
    // 1. Alert for Time (เวลา)
    const latestMaintenance = maintenance[0];
    if (latestMaintenance) {
      const diff = Math.abs(currentDate.getTime() - new Date(latestMaintenance.date).getTime());
      const daysSinceCleaning = Math.ceil(diff / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'เวลา',
        message: `ล้างถังครั้งล่าสุดเมื่อ ${new Date(latestMaintenance.date).toISOString().split('T')[0]} (${daysSinceCleaning} วันที่ผ่านมา)`,
        active: daysSinceCleaning >= 90,
      });
    } else {
      alerts.push({
        type: 'เวลา',
        message: 'ยังไม่พบประวัติการล้างถัง',
        active: true,
      });
    }

    // 2. Alert for Turbidity (ความขุ่น)
    if (water) {
      const waterStatus = water.turbidity >= 10 ? 'Critical' : water.turbidity >= 5 ? 'Alert' : 'Normal';
      alerts.push({
        type: 'ความขุ่น',
        message: waterStatus === 'Critical'
          ? 'ค่าความขุ่นสูงเกินเกณฑ์ ต้องรีบดำเนินการ'
          : waterStatus === 'Alert'
          ? 'ค่าความขุ่นสูงกว่าปกติ โปรดตรวจสอบ'
          : 'ค่าความขุ่นอยู่ในเกณฑ์ปกติ',
        active: waterStatus !== 'Normal',
      });
    } else {
      alerts.push({ type: 'ความขุ่น', message: 'ไม่มีข้อมูลน้ำ', active: false });
    }

    // 3. Alert for Complaints (ร้องเรียน)
    const pendingComplaints = complaints.filter(c => c.status !== 'เสร็จงาน');
    alerts.push({
      type: 'ร้องเรียน',
      message: pendingComplaints.length > 0 ? `มีการร้องเรียนที่ยังไม่ได้ดำเนินการ ${pendingComplaints.length} รายการ` : 'ไม่มีเรื่องร้องเรียนค้างดำเนินการ',
      active: pendingComplaints.length > 0,
    });

    res.status(200).json({
      water,
      alerts,
      bugs,
      maintenance,
      plans,
      admins,
      contact: contact || {},
      history,
      complaints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
