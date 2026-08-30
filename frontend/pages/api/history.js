import dbConnect from '../../utils/dbConnect';
import History from '../../models/HistoryModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const records = await History.find().sort({ date: -1 });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
