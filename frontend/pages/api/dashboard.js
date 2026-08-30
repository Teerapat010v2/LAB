import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';
import Bug from '../../models/BugModel';
import Maintenance from '../../models/MaintenanceModel';
import Plan from '../../models/PlanModel';
import Admin from '../../models/AdminModel';
import Contact from '../../models/ContactModel';
import History from '../../models/HistoryModel';
import Complaint from '../../models/ComplaintModel';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const [water, bugs, maintenance, plans, admins, contact, history, complaints] = await Promise.all([
      Water.findOne().sort({ timestamp: -1 }).lean(),
      Bug.find().sort({ submittedAt: -1 }).lean(),
      Maintenance.find().sort({ date: -1 }).lean(),
      Plan.find().sort({ scheduleDate: 1 }).lean(),
      Admin.find().lean(),
      Contact.findOne().lean(),
      History.find().sort({ date: -1 }).lean(),
      Complaint.find().sort({ submittedAt: -1 }).lean()
    ]);

    // Calculate Alerts based on latest Water
    const alerts = [];
    if (water) {
      if (water.turbidity > 5) {
        alerts.push({ type: 'ความขุ่นเกินมาตรฐาน', message: `พบค่าความขุ่น ${water.turbidity} NTU`, active: true });
      }
      
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const latestMaintenance = maintenance[0];
      if (!latestMaintenance || new Date(latestMaintenance.date) < twoDaysAgo) {
        alerts.push({ 
          type: 'เลยกำหนดเวลาล้างถัง', 
          message: latestMaintenance ? `ล้างถังครั้งล่าสุดเมื่อ ${new Date(latestMaintenance.date).toLocaleDateString('th-TH')}` : 'ไม่มีประวัติการล้างถัง', 
          active: true 
        });
      }

      const pendingComplaints = complaints.filter(c => c.status !== 'เสร็จงาน');
      if (pendingComplaints.length > 0) {
        alerts.push({ type: 'ร้องเรียน', message: `มีข้อร้องเรียนที่ยังไม่ได้ดำเนินการ ${pendingComplaints.length} รายการ`, active: true });
      }
    }

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
