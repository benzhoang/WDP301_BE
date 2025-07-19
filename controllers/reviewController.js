const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

exports.createReview = async (req, res) => {
  try {
    const { user, product, rating, comment } = req.body;
    // Kiểm tra user và product tồn tại
    const userExists = await User.findById(user);
    const productExists = await Product.findById(product);
    if (!userExists || !productExists) {
      return res.status(404).json({ success: false, error: "User or product not found" });
    }
    const review = new Review({ user, product, rating, comment });
    await review.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user product");
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 