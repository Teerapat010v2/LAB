const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const admins = await state.getAdmins();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, note } = req.body;
    const admin = {
      name: name || 'ไม่ระบุชื่อ',
      phone: phone || '-',
      note: note || '',
    };
    const admins = await state.addAdmin(admin);
    res.json({ message: 'เพิ่มผู้ดูแลระบบประปาเรียบร้อยแล้ว', admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
