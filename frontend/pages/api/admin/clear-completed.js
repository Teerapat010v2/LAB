import dbConnect from '../../../utils/dbConnect';
import Bug from '../../../models/BugModel';
import Complaint from '../../../models/ComplaintModel';
import Plan from '../../../models/PlanModel';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const bugs = await Bug.deleteMany({ status: 'เสร็จงาน' });
    const complaints = await Complaint.deleteMany({ status: 'เสร็จงาน' });
    const plans = await Plan.deleteMany({ status: 'ล้างแล้ว' });

    res.status(200).json({
      message: 'ลบประวัติที่เสร็จสิ้นเรียบร้อยแล้ว',
      deletedCounts: {
        bugs: bugs.deletedCount,
        complaints: complaints.deletedCount,
        plans: plans.deletedCount,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
