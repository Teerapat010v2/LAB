import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';

const TURBIDITY_THRESHOLD = 5.0;

function getStatus(turbidity) {
  if (turbidity >= TURBIDITY_THRESHOLD * 2) return 'Critical';
  if (turbidity >= TURBIDITY_THRESHOLD) return 'Alert';
  return 'Normal';
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let waterReading = await Water.findOne().sort({ timestamp: -1 });
      if (!waterReading) {
        waterReading = await Water.create({ turbidity: 2.5 });
      }

      const status = getStatus(waterReading.turbidity);
      let message = 'คุณภาพน้ำปกติ';
      if (status === 'Alert') message = 'ค่าความขุ่นเพิ่มขึ้น โปรดติดตามใกล้ชิด';
      else if (status === 'Critical') message = 'ความขุ่นสูงเกินเกณฑ์ แจ้งผู้ดูแลทันที';

      res.status(200).json({
        turbidity: waterReading.turbidity,
        status,
        level: status === 'Normal' ? 'ปกติ' : status === 'Alert' ? 'เตือน' : 'วิกฤติ',
        threshold: TURBIDITY_THRESHOLD,
        message,
        timestamp: waterReading.timestamp,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
