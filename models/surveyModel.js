const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  type: { type: String, required: true },
  questions: [{ type: String, required: true }],
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Survey", surveySchema); 