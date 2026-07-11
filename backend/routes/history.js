const router = require('express').Router();

const history = [
  { date: '2026-04-01', note: 'ล้างถังน้ำตามกำหนด' },
  { date: '2026-01-01', note: 'ล้างถังเพราะค่าความขุ่นสูง' },
];

router.get('/', (req, res) => {
  res.json(history);
});

module.exports = router;