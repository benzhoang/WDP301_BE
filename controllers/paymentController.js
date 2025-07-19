const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

exports.createPayment = async (req, res) => {
  try {
    const { order, user, amount, method, status, transaction_id, paid_at } = req.body;
    // Kiểm tra order và user tồn tại
    const orderExists = await Order.findById(order);
    const userExists = await User.findById(user);
    if (!orderExists || !userExists) {
      return res.status(404).json({ success: false, error: "Order or user not found" });
    }
    const payment = new Payment({ order, user, amount, method, status, transaction_id, paid_at });
    await payment.save();
    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("order user");
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 