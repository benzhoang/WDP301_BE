const mongoose = require("mongoose");

const consultantSlotSchema = new mongoose.Schema({
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
  day_of_week: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("ConsultantSlot", consultantSlotSchema); 