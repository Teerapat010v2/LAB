const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const history = await state.getHistoryRecords();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
