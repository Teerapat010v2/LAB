const router = require('express').Router();
const state = require('../data/state');

router.get('/', async (req, res) => {
  try {
    const complaints = await state.getComplaints();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, topic, message } = req.body;
    const complaint = await state.addComplaint({ name, phone, topic, message });
    res.json({ message: 'ส่งเรื่องร้องเรียนเรียบร้อยแล้ว', complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'ต้องระบุสถานะใหม่' });
    }
    const updated = await state.updateComplaintStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'ไม่พบเรื่องร้องเรียนนี้' });
    }
    res.json({ message: 'อัพเดตสถานะเรื่องร้องเรียนเรียบร้อยแล้ว', complaint: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
