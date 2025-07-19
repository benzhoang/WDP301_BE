const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: String, required: true }, // Có thể thay bằng ObjectId nếu có model slot riêng
  booking_date: { type: Date, required: true },
  status: { type: String, default: "scheduled" },
  notes: { type: String },
  google_meet_link: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema); 