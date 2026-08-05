const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getCleaningPlans());
});

router.post('/', (req, res) => {
  const { scheduleDate, description, assignedTo } = req.body;
  const plan = state.addCleaningPlan({ scheduleDate, description, assignedTo });
  res.json({ message: 'เพิ่มแผนการล้างถังเรียบร้อยแล้ว', plan });
});

module.exports = router;
