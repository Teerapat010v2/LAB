const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getContact()); // Contact is still synchronous in state.js
});

router.post('/', (req, res) => {
  const { name, phone, note } = req.body;
  const updated = state.updateContact({ name, phone, note }); // Also synchronous
  res.json({ message: 'บันทึกข้อมูลผู้ดูแลเรียบร้อยแล้ว', contact: updated });
});

module.exports = router;
