const mongoose = require('mongoose');

const WaterSchema = new mongoose.Schema({
  turbidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Water', WaterSchema);