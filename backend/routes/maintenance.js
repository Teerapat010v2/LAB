const router = require('express').Router();

const records = [
  { date: '2026-04-01', reason: 'การล้างตามกำหนด', note: 'ล้างถังราย 3 เดือน' },
];

router.get('/', (req, res) => {
  res.json(records);
});

router.post('/', (req, res) => {
  const { date, reason, note } = req.body;
  const record = {
    date: date || new Date().toISOString().split('T')[0],
    reason: reason || 'ไม่ระบุเหตุผล',
    note: note || '',
  };
  records.push(record);
  res.json({ message: 'เพิ่มบันทึกการล้างถังเรียบร้อยแล้ว', record });
});

module.exports = router;