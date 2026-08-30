import dbConnect from '../../../utils/dbConnect';
import Bug from '../../../models/BugModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const bugs = await Bug.find().sort({ submittedAt: -1 });
      res.status(200).json(bugs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newBug = await Bug.create({
        name: req.body.name || 'ผู้ใช้งาน',
        phone: req.body.phone || '-',
        topic: req.body.topic,
        message: req.body.message
      });
      res.status(201).json(newBug);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
