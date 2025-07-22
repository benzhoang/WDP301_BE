const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const path = require('path');
const fs = require('fs');

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

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('author');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const blogs = await Blog.find({ author: userId }).populate('author');
    res.status(200).json({ success: true, data: blogs, count: blogs.length, message: 'Your blogs retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve your blogs', error: err.message });
  }
};

exports.getPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' }).sort({ created_at: 1 }).populate('author');
    res.status(200).json({ success: true, data: blogs, count: blogs.length, message: 'Pending blogs retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve pending blogs', error: err.message });
  }
};

exports.getAllBlogsForAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ created_at: -1 }).populate('author');
    res.status(200).json({ success: true, data: blogs, count: blogs.length, message: 'All blogs retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve all blogs', error: err.message });
  }
};

exports.getModerationStats = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!userRole || !['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only staff members can access moderation statistics' });
    }
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: { $in: ['Đã xuất bản', 'published'] } });
    const draft = await Blog.countDocuments({ status: 'draft' });
    const pending = await Blog.countDocuments({ status: 'pending' });
    const hidden = await Blog.countDocuments({ status: 'hidden' });
    const recentPending = await Blog.find({ status: 'pending' }).sort({ created_at: 1 }).limit(5);
    const stats = { total, published, draft, pending, hidden, recentPending };
    res.status(200).json({ success: true, data: stats, message: 'Blog moderation statistics retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve moderation statistics', error: err.message });
  }
};

exports.approveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const staffUserId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userRole || !['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only staff members can approve blog posts' });
    }
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending blogs can be approved', currentStatus: blog.status });
    }
    blog.status = 'Đã xuất bản';
    // Optionally add approval metadata
    blog.approved_by = staffUserId;
    blog.approved_at = new Date();
    await blog.save();
    res.status(200).json({ success: true, data: blog, message: 'Blog approved and published successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve blog', error: err.message });
  }
};

exports.rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userRole = req.user?.role;
    const staffUserId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userRole || !['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only staff members can reject blog posts' });
    }
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Rejection reason must be at least 10 characters long' });
    }
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending blogs can be rejected', currentStatus: blog.status });
    }
    blog.status = 'draft';
    blog.rejected_by = staffUserId;
    blog.rejected_at = new Date();
    blog.rejection_reason = rejectionReason.trim();
    await blog.save();
    res.status(200).json({ success: true, data: blog, message: 'Blog rejected and returned to draft' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject blog', error: err.message });
  }
};

exports.createBlogWithImage = async (req, res) => {
  // Để lại khung, cần tích hợp multer hoặc upload middleware nếu muốn upload ảnh thực tế
  res.json({ success: true, message: 'createBlogWithImage endpoint (chưa triển khai upload ảnh thực tế)' });
}; 