const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  maintenanceIntervalDays: { type: Number, default: 90 },
  contactName: { type: String, default: 'ผู้ดูแลระบบประปา' },
  contactPhone: { type: String, default: '080-123-4567' },
  contactNote: { type: String, default: 'ติดต่อเมื่อมีเหตุฉุกเฉิน' }
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
