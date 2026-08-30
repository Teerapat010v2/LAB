const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  note: { type: String, required: true },
});

module.exports = mongoose.model('History', HistorySchema);
