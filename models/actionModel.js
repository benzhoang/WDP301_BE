const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  // Thêm các trường khác nếu cần
}, {
  timestamps: true
});

module.exports = mongoose.model("Action", actionSchema); 