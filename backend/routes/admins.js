const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getAdmins());
});

router.post('/', (req, res) => {
  const { name, phone, note } = req.body;
  const admin = {
    name: name || 'ไม่ระบุชื่อ',
    phone: phone || '-',
    note: note || '',
  };
  const admins = state.addAdmin(admin);
  res.json({ message: 'เพิ่มผู้ดูแลระบบประปาเรียบร้อยแล้ว', admins });
});

module.exports = router;
