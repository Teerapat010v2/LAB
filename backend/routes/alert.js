const router = require('express').Router();

router.get('/', (req, res) => {
  res.json([
    { type: 'เวลา', message: 'ถึงเวลาล้างถังแล้ว', active: true },
    { type: 'ความขุ่น', message: 'ค่าความขุ่นสูงเกินเกณฑ์', active: false },
  ]);
});

module.exports = router;