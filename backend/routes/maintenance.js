const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const records = await state.getMaintenanceRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, reason, note } = req.body;
    const record = {
      date: date || new Date().toISOString().split('T')[0],
      reason: reason || 'ไม่ระบุเหตุผล',
      note: note || '',
    };
    const newRecord = await state.addMaintenanceRecord(record);
    res.json({ message: 'เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว', record: newRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
