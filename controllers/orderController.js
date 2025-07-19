const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

exports.createOrder = async (req, res) => {
  try {
    const { user, products, total, status, address, payment_method, note } = req.body;
    // Kiểm tra user tồn tại
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    // Kiểm tra từng sản phẩm
    for (const item of products) {
      const productExists = await Product.findById(item.product);
      if (!productExists) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.product}` });
      }
    }
    const order = new Order({ user, products, total, status, address, payment_method, note });
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user products.product");
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 