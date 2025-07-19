const Blog = require("../models/blogModel");
const User = require("../models/userModel");

exports.createBlog = async (req, res) => {
  try {
    const { author, title, body, status, image, tags, published_at } = req.body;
    const userExists = await User.findById(author);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "Author not found" });
    }
    const blog = new Blog({ author, title, body, status, image, tags, published_at });
    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author");
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy blog theo tác giả
exports.getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const blogs = await Blog.find({ author: authorId }).populate("author");
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy blog theo trạng thái
exports.getBlogsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const blogs = await Blog.find({ status }).populate("author");
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const blog = await Blog.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Xóa blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    res.json({ success: true, message: "Blog deleted", data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật trạng thái blog
exports.updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const blog = await Blog.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 