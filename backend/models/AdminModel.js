const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  note: { type: String },
});

module.exports = mongoose.model('Admin', AdminSchema);
