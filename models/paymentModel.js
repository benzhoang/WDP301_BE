const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, default: "pending" },
  transaction_id: { type: String },
  paid_at: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema); 