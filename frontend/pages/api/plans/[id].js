import dbConnect from '../../../utils/dbConnect';
import Plan from '../../../models/PlanModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await Plan.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
      if (req.body.status === 'ล้างแล้ว') {
        const Maintenance = require('../../../models/MaintenanceModel');
        await Maintenance.create({
          date: new Date().toISOString().split('T')[0],
          reason: updated.description,
          note: `ดำเนินการโดย: ${updated.assignedTo}`
        });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
