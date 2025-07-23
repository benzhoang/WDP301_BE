const mongoose = require("mongoose");

const enrollSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  enrolled_at: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
  progress: { type: Array, default: [] },
  completed_at: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("Enroll", enrollSchema); 