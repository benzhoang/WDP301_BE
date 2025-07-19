const mongoose = require("mongoose");

const consoleLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  message: { type: String },
  level: { type: String, default: "info" }, // info, warning, error, ...
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("ConsoleLog", consoleLogSchema); 