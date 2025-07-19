const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

exports.createCart = async (req, res) => {
  try {
    const { user, items, status } = req.body;
    // Kiểm tra user tồn tại
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    // Kiểm tra từng sản phẩm
    for (const item of items) {
      const productExists = await Product.findById(item.product);
      if (!productExists) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.product}` });
      }
    }
    const cart = new Cart({ user, items, status });
    await cart.save();
    res.status(201).json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getCartByUser = async (req, res) => {
  try {
    const { user } = req.query;
    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 