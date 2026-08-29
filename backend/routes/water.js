const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const data = await state.getWaterData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { turbidity } = req.body;
    const updated = await state.updateWaterReading(Number(turbidity));
    res.json({
      message: 'บันทึกข้อมูลน้ำเรียบร้อยแล้ว',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
