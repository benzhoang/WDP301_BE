const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  stock: { type: Number, default: 0 },
  image: { type: String },
  // Thêm các trường khác nếu cần
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema); 