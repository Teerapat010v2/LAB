import dbConnect from '../../../utils/dbConnect';
import Admin from '../../../models/AdminModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const admins = await Admin.find();
      res.status(200).json(admins);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newAdmin = await Admin.create({
        name: req.body.name || 'ไม่ระบุชื่อ',
        phone: req.body.phone || '-',
        note: req.body.note || '',
        role: req.body.role || 'Admin'
      });
      res.status(201).json(newAdmin);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
