const mongoose = require("mongoose");

const surveyResponseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{ question: String, answer: mongoose.Schema.Types.Mixed }],
  submitted_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("SurveyResponse", surveyResponseSchema); 