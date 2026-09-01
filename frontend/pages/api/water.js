import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';

// เกณฑ์มาตรฐาน NTU สากล
function getStatus(ntu) {
  if (ntu <= 25) return { status: 'Normal', level: 'น้ำใส', message: 'คุณภาพน้ำปกติ ใสสะอาด ดื่มได้' };
  if (ntu <= 100) return { status: 'Alert', level: 'ขุ่นปานกลาง', message: 'น้ำมีตะกอนหรือสารแขวนลอยปนเปื้อน' };
  if (ntu <= 200) return { status: 'Warning', level: 'ขุ่นมาก', message: 'น้ำไม่สะอาด มีตะกอนหนาแน่น ห้ามดื่ม' };
  return { status: 'Critical', level: 'น้ำเสีย', message: 'ความขุ่นสูงเกินเกณฑ์ แจ้งผู้ดูแลทันที' };
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let waterReading = await Water.findOne().sort({ timestamp: -1 });
      if (!waterReading) {
        waterReading = await Water.create({ turbidity: 2.5 });
      }

      const { status, level, message } = getStatus(waterReading.turbidity);

      res.status(200).json({
        turbidity: waterReading.turbidity,
        status,
        level,
        message,
        timestamp: waterReading.timestamp,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { turbidity } = req.body;
      
      if (turbidity === undefined) {
        return res.status(400).json({ error: 'Turbidity value is required' });
      }

      const waterReading = await Water.create({ turbidity: Number(turbidity) });
      
      res.status(201).json({ success: true, data: waterReading });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
