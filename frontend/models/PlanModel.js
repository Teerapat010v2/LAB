const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  scheduleDate: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  status: { type: String, default: 'ตามแผน' }, // ตามแผน, กำลังดำเนินการ, เสร็จสิ้น
  routineInterval: { type: Number, default: null } // Number of days to recur. If null/0, it's a one-off.
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
