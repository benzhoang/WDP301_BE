const mongoose = require("mongoose");

const bookingSessionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: String, required: true }, // hoặc ref tới Slot nếu có
  booking_date: { type: Date, required: true },
  status: { type: String, default: "scheduled" },
  notes: { type: String },
  google_meet_link: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("BookingSession", bookingSessionSchema); 