import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    // Expected payload from hardware: { turbidity: 5.42 }
    try {
      const turbidity = parseFloat(req.body.turbidity);
      if (!isNaN(turbidity)) {
        await Water.create({ turbidity });
        res.status(200).json({ success: true, turbidity });
      } else {
        res.status(400).json({ error: 'Invalid turbidity value' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
