import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';
import Bug from '../../models/BugModel';
import Maintenance from '../../models/MaintenanceModel';
import Plan from '../../models/PlanModel';
import Admin from '../../models/AdminModel';
import History from '../../models/HistoryModel';
import Complaint from '../../models/ComplaintModel';
import Settings from '../../models/SettingsModel';

export default async function handler(req, res) {
  await dbConnect();

  try {
    let [water, bugs, maintenance, plans, admins, history, complaints, settings] = await Promise.all([
      Water.findOne().sort({ timestamp: -1 }).lean(),
      Bug.find().lean(),
      Maintenance.find().sort({ date: -1 }).lean(),
      Plan.find().lean(),
      Admin.find().lean(),
      History.find().sort({ date: -1 }).lean(),
      Complaint.find().lean(),
      Settings.findOne().lean()
    ]);

    const statusWeightBugs = { 'กำลังดำเนินการ': 1, 'รับงาน': 1, 'รอดำเนินการ': 2, 'เสร็จงาน': 3 };
    bugs.sort((a, b) => {
      const wA = statusWeightBugs[a.status] || 99;
      const wB = statusWeightBugs[b.status] || 99;
      if (wA !== wB) return wA - wB;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    const statusWeightComplaints = { 'กำลังดำเนินการ': 1, 'รับงาน': 1, 'รอดำเนินการ': 2, 'เสร็จงาน': 3 };
    complaints.sort((a, b) => {
      const wA = statusWeightComplaints[a.status] || 99;
      const wB = statusWeightComplaints[b.status] || 99;
      if (wA !== wB) return wA - wB;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    const statusWeightPlans = { 'กำลังดำเนินการ': 1, 'ตามแผน': 1, 'เสร็จสิ้น': 2 };
    plans.sort((a, b) => {
      const wA = statusWeightPlans[a.status] || 99;
      const wB = statusWeightPlans[b.status] || 99;
      if (wA !== wB) return wA - wB;
      if (a.status === 'เสร็จสิ้น') return new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime();
      return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });
    
    if (!settings) {
      settings = { maintenanceIntervalDays: 90, contactName: 'ผู้ดูแลระบบประปา', contactPhone: '080-123-4567', contactNote: 'ติดต่อเมื่อมีเหตุฉุกเฉิน' };
    }

    const contact = {
      name: settings.contactName,
      phone: settings.contactPhone,
      note: settings.contactNote,
    };

    const alerts = [];
    const currentDate = new Date();
    
    // 1. Alert for Upcoming Plans (กำหนดการถัดไป)
    let daysUntilNextCleaning = null;
    let message = 'ยังไม่มีแผนงานที่กำหนดเวลาไว้';
    let active = false;

    const upcomingPlans = plans.filter(p => p.status !== 'เสร็จสิ้น' && p.scheduleDate);
    if (upcomingPlans.length > 0) {
      // Sort to get the earliest upcoming date
      upcomingPlans.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
      const nextPlan = upcomingPlans[0];
      const diff = new Date(nextPlan.scheduleDate).getTime() - currentDate.getTime();
      daysUntilNextCleaning = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (daysUntilNextCleaning < 0) {
        message = `เลยกำหนดงาน: ${nextPlan.description} มาแล้ว ${Math.abs(daysUntilNextCleaning)} วัน`;
        active = true;
      } else if (daysUntilNextCleaning === 0) {
        message = `ถึงกำหนดงาน: ${nextPlan.description} (วันนี้)`;
        active = true;
      } else {
        message = `งานถัดไป: ${nextPlan.description} (อีก ${daysUntilNextCleaning} วัน)`;
        active = daysUntilNextCleaning <= 7; // Warning if within 7 days
      }
    }

    alerts.push({
      type: 'กำหนดการถัดไป',
      message: message,
      active: active,
    });

    // 2. Alert for Work In Progress (งานที่สตาฟกำลังทำ)
    const inProgressTasks = [
      ...bugs.filter(b => b.status === 'กำลังดำเนินการ').map(b => b.topic),
      ...complaints.filter(c => c.status === 'กำลังดำเนินการ' || c.status === 'รับงาน').map(c => c.topic),
      ...plans.filter(p => p.status === 'กำลังดำเนินการ').map(p => p.description)
    ];

    if (inProgressTasks.length > 0) {
      alerts.push({
        type: 'งานที่กำลังดำเนินการ',
        message: inProgressTasks.join(', '),
        active: true,
      });
    } else {
      alerts.push({
        type: 'งานที่กำลังดำเนินการ',
        message: 'ขณะนี้สตาฟไม่มีงานที่กำลังดำเนินการ',
        active: false,
      });
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
      daysUntilNextCleaning,
      bugs,
      maintenance,
      plans,
      admins,
      contact,
      settings,
      history,
      complaints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
