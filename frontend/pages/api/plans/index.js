import dbConnect from '../../../utils/dbConnect';
import Plan from '../../../models/PlanModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const plans = await Plan.find().sort({ scheduleDate: -1 });
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newPlan = await Plan.create({
        scheduleDate: req.body.scheduleDate || new Date().toISOString().split('T')[0],
        description: req.body.description || 'แผนการล้างถัง',
        assignedTo: req.body.assignedTo || 'ทีมช่าง',
        routineInterval: req.body.routineInterval ? parseInt(req.body.routineInterval, 10) : null,
      });
      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
