const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  score: { type: Number },
  result: { type: String },
  details: { type: String }, // Có thể lưu JSON string hoặc object
  taken_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Assessment", assessmentSchema); 