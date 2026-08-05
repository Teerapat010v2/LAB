const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getMaintenanceRecords());
});

router.post('/', (req, res) => {
  const { date, reason, note } = req.body;
  const record = {
    date: date || new Date().toISOString().split('T')[0],
    reason: reason || 'ไม่ระบุเหตุผล',
    note: note || '',
  };
  state.addMaintenanceRecord(record);
  res.json({ message: 'เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว', record });
});

module.exports = router;
