const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Open' },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bug', BugSchema);
