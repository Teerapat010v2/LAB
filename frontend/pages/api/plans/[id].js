import dbConnect from '../../../utils/dbConnect';
import Plan from '../../../models/PlanModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await Plan.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
      if (req.body.status === 'เสร็จสิ้น') {
        const Maintenance = require('../../../models/MaintenanceModel');
        const History = require('../../../models/HistoryModel');
        
        await Maintenance.create({
          date: new Date().toISOString().split('T')[0],
          reason: updated.description,
          note: `ดำเนินการโดย: ${updated.assignedTo}`
        });

        await History.create({
          date: new Date().toISOString().split('T')[0],
          note: `บันทึกประวัติการบำรุงรักษา: ${updated.description} (ดำเนินการโดย: ${updated.assignedTo})`,
        });

        if (updated.routineInterval && updated.routineInterval > 0) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + updated.routineInterval);
          await Plan.create({
            scheduleDate: nextDate.toISOString().split('T')[0],
            description: updated.description,
            assignedTo: updated.assignedTo,
            status: 'ตามแผน',
            routineInterval: updated.routineInterval
          });
        }
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
