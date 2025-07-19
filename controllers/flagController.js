const Flag = require("../models/flagModel");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");

exports.createFlag = async (req, res) => {
  try {
    const { blog, user, reason } = req.body;
    const blogExists = await Blog.findById(blog);
    const userExists = await User.findById(user);
    if (!blogExists || !userExists) {
      return res.status(404).json({ success: false, error: "Blog or user not found" });
    }
    const flag = new Flag({ blog, user, reason });
    await flag.save();
    res.status(201).json({ success: true, flag });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllFlags = async (req, res) => {
  try {
    const flags = await Flag.find().populate("blog user");
    res.json({ success: true, data: flags });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 