const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json({ alerts: state.getAlerts(), contact: state.getContact() });
});

module.exports = router;
