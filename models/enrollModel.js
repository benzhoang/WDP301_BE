const mongoose = require("mongoose");

const enrollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  enrolled_at: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
  progress: { type: Number, default: 0 },
  completed_at: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("Enroll", enrollSchema); 