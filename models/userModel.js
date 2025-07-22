const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member' },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  img_link: { type: String, default: null }
  // Không có trường name ở đây, nếu có hãy chuyển sang profileModel
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 