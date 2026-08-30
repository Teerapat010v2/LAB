import dbConnect from '../../../utils/dbConnect';
import Bug from '../../../models/BugModel';
import Complaint from '../../../models/ComplaintModel';
import Plan from '../../../models/PlanModel';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const { type } = req.query;

  try {
    let deletedCount = 0;
    if (type === 'bugs') {
      const result = await Bug.deleteMany({ status: 'เสร็จงาน' });
      deletedCount = result.deletedCount;
    } else if (type === 'complaints') {
      const result = await Complaint.deleteMany({ status: 'เสร็จงาน' });
      deletedCount = result.deletedCount;
    } else if (type === 'plans') {
      const result = await Plan.deleteMany({ status: 'เสร็จสิ้น' });
      deletedCount = result.deletedCount;
    } else if (type === 'maintenance') {
      const result = await require('../../../models/MaintenanceModel').deleteMany({});
      deletedCount = result.deletedCount;
    } else if (type === 'history') {
      const result = await require('../../../models/HistoryModel').deleteMany({});
      deletedCount = result.deletedCount;
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    res.status(200).json({
      message: 'ลบประวัติที่เสร็จสิ้นเรียบร้อยแล้ว',
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
