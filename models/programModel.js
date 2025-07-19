const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  start_date: { type: Date },
  end_date: { type: Date },
  status: { type: String, default: "active" },
  image: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true
});

module.exports = mongoose.model("Program", programSchema); 