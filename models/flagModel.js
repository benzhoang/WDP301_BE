const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Flag", flagSchema); 