import dbConnect from '../../../utils/dbConnect';
import Complaint from '../../../models/ComplaintModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const complaints = await Complaint.find().sort({ submittedAt: -1 });
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newComplaint = await Complaint.create({
        name: req.body.name || 'ผู้ใช้งาน',
        phone: req.body.phone || '-',
        topic: req.body.topic,
        message: req.body.message
      });
      res.status(201).json(newComplaint);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
