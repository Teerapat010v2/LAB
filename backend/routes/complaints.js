const router = require('express').Router();
const state = require('../data/state');

router.get('/', (req, res) => {
  res.json(state.getComplaints());
});

router.post('/', (req, res) => {
  const { name, phone, topic, message } = req.body;
  const complaint = state.addComplaint({ name, phone, topic, message });
  res.json({ message: 'ส่งเรื่องร้องเรียนเรียบร้อยแล้ว', complaint });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'ต้องระบุสถานะใหม่' });
  }
  const updated = state.updateComplaintStatus(id, status);
  if (!updated) {
    return res.status(404).json({ message: 'ไม่พบเรื่องร้องเรียนนี้' });
  }
  res.json({ message: 'อัพเดตสถานะเรื่องร้องเรียนเรียบร้อยแล้ว', complaint: updated });
});

module.exports = router;
