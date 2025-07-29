const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  start_date: { type: Date },
  end_date: { type: Date },
  status: { type: String, default: "active" },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Program", programSchema);