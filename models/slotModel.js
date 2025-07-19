const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  label: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Slot", slotSchema); 