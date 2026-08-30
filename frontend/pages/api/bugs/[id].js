import dbConnect from '../../../utils/dbConnect';
import Bug from '../../../models/BugModel';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await Bug.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
