const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getContact());
});

router.post('/', (req, res) => {
  const { name, phone, note } = req.body;
  const updated = state.updateContact({ name, phone, note });
  res.json({ message: 'บันทึกข้อมูลผู้ดูแลเรียบร้อยแล้ว', contact: updated });
});

module.exports = router;
