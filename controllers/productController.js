const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;
    const product = new Product({ name, description, price, category, stock, image });
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 