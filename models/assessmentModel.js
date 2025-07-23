const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  score: { type: Number },
  result_json: { type: Object },
  taken_at: { type: Date, default: Date.now },
  action_id: { type: mongoose.Schema.Types.ObjectId, ref: "Action" , required: true}// Tham chiếu đến Action nếu cần
}, {
  timestamps: true
});

module.exports = mongoose.model("Assessment", assessmentSchema); 