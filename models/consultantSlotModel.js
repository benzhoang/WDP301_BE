const mongoose = require("mongoose");

const consultantSlotSchema = new mongoose.Schema({
  consultant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true }, // Thêm trường này
  day_of_week: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("ConsultantSlot", consultantSlotSchema);