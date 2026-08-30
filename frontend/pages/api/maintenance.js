import dbConnect from '../../utils/dbConnect';
import Maintenance from '../../models/MaintenanceModel';
import History from '../../models/HistoryModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const records = await Maintenance.find().sort({ date: -1 });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const dateStr = req.body.date || new Date().toISOString().split('T')[0];
      const newRecord = await Maintenance.create({
        date: dateStr,
        reason: req.body.reason || 'ล้างถังทั่วไป',
        note: req.body.note || '',
      });

      await History.create({
        date: dateStr,
        note: `${newRecord.reason} - ${newRecord.note}`,
      });

      res.status(201).json(newRecord);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
