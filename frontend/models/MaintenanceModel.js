const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  reason: { type: String, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);