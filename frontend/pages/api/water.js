import dbConnect from '../../utils/dbConnect';
import Water from '../../models/WaterModel';

// เกณฑ์มาตรฐาน NTU น้ำประปา
function getStatus(ntu, timestamp) {
  const lastUpdate = new Date(timestamp).getTime();
  const now = new Date().getTime();
  const isOffline = (now - lastUpdate) > 60000; // ถ้านานกว่า 1 นาที ถือว่าออฟไลน์
  
  if (isOffline) return { status: 'Offline', level: 'ขาดการติดต่อ', message: 'เซ็นเซอร์ออฟไลน์หรือไม่เชื่อมต่อเน็ต ไม่สามารถวัดค่าได้' };
  
  if (ntu <= 5) return { status: 'Normal', level: 'น้ำใส', message: 'คุณภาพน้ำประปาปกติ (ตามเกณฑ์ < 5 NTU)' };
  if (ntu <= 15) return { status: 'Alert', level: 'เริ่มขุ่น', message: 'น้ำเริ่มมีตะกอนปนเปื้อนเล็กน้อย ควรตรวจสอบ' };
  if (ntu <= 30) return { status: 'Warning', level: 'ขุ่นมาก', message: 'น้ำประปาขุ่นเกินมาตรฐาน ไม่ควรใช้งาน' };
  return { status: 'Critical', level: 'น้ำเสีย', message: 'ความขุ่นสูงมาก งดใช้น้ำและแจ้งช่างประปา' };
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let waterReading = await Water.findOne().sort({ timestamp: -1 });
      if (!waterReading) {
        waterReading = await Water.create({ turbidity: 2.5 });
      }

      const { status, level, message } = getStatus(waterReading.turbidity, waterReading.timestamp);

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
