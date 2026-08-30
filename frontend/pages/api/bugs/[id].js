import dbConnect from '../../../utils/dbConnect';
import Bug from '../../../models/BugModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await Bug.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
      if (req.body.status === 'เสร็จงาน') {
        const History = require('../../../models/HistoryModel');
        await History.create({
          date: new Date().toISOString().split('T')[0],
          note: `แก้ไขปัญหาระบบเรียบร้อย: ${updated.topic}`,
        });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await Bug.findByIdAndDelete(id);
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
