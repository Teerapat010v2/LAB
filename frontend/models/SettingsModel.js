const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // maintenanceIntervalDays is deprecated in favor of per-plan routineInterval
  contactName: { type: String, default: 'ผู้ดูแลระบบประปา' },
  contactPhone: { type: String, default: '080-123-4567' },
  contactNote: { type: String, default: 'ติดต่อเมื่อมีเหตุฉุกเฉิน' }
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
