const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const alerts = await state.getAlerts();
    const contact = await state.getContact();
    res.json({ alerts, contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
