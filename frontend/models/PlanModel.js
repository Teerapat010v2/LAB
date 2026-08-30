const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  scheduleDate: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  status: { type: String, default: 'Planned' },
});

module.exports = mongoose.model('Plan', PlanSchema);
