const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getWaterData());
});

router.post('/', (req, res) => {
  const { turbidity } = req.body;
  const updated = state.updateWaterReading(Number(turbidity));
  res.json({
    message: 'บันทึกข้อมูลน้ำเรียบร้อยแล้ว',
    data: updated,
  });
});

module.exports = router;
