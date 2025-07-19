const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  social_provider: { type: String },
  status: { type: Boolean, default: true },
  // Thêm các trường khác nếu cần
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema); 