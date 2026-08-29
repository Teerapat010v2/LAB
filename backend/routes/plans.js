const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const plans = await state.getCleaningPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { scheduleDate, description, assignedTo } = req.body;
    const plan = await state.addCleaningPlan({ scheduleDate, description, assignedTo });
    res.json({ message: 'เพิ่มแผนการล้างถังเรียบร้อยแล้ว', plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
