const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getHistoryRecords());
});

module.exports = router;
