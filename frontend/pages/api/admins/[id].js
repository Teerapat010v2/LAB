import dbConnect from '../../../utils/dbConnect';
import Admin from '../../../models/AdminModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await Admin.findByIdAndDelete(id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await Admin.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
