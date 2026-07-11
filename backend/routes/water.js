const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    turbidity: 2.5,
    status: 'Normal',
    timestamp: new Date().toISOString(),
  });
});

router.post('/', (req, res) => {
  const { turbidity, status } = req.body;
  res.json({
    message: 'บันทึกข้อมูลน้ำเรียบร้อยแล้ว',
    data: {
      turbidity: turbidity ?? 2.5,
      status: status ?? 'Normal',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;