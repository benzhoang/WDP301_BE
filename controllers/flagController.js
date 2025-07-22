const Flag = require('../models/flagModel');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

exports.getAllFlags = async (req, res) => {
  try {
    const flags = await Flag.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: flags, message: 'Flags retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve flags', error: err.message });
  }
};

exports.createFlag = async (req, res) => {
  try {
    const { blog_id, reason } = req.body;
    const flagged_by = req.user?.userId || req.user?._id || req.user?.id;
    if (!blog_id) return res.status(400).json({ success: false, message: 'Blog ID is required' });
    const blog = await Blog.findById(blog_id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const user = await User.findById(flagged_by);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const existingFlag = await Flag.findOne({ blog_id, flagged_by });
    if (existingFlag) return res.status(409).json({ success: false, message: 'You have already flagged this blog' });
    const newFlag = new Flag({ blog_id, flagged_by, reason, created_at: new Date() });
    const savedFlag = await newFlag.save();
    const flagCount = await Flag.countDocuments({ blog_id });
    let blogHidden = false;
    let blogDeleted = false;
    if (flagCount >= 3) {
      await Blog.findByIdAndDelete(blog_id);
      blogDeleted = true;
    } else if (flagCount >= 1 && blog.status !== 'hidden') {
      blog.status = 'hidden';
      await blog.save();
      blogHidden = true;
    }
    // Ban author nếu có >=5 blog bị flag
    const authorId = blog.author;
    if (authorId) {
      const flaggedBlogs = await Flag.distinct('blog_id', { flagged_by: { $ne: null } });
      const authorFlaggedCount = await Blog.countDocuments({ author: authorId, _id: { $in: flaggedBlogs } });
      if (authorFlaggedCount >= 5) {
        await User.findByIdAndUpdate(authorId, { status: 'banned' });
        return res.status(201).json({ success: true, data: savedFlag, message: 'Blog flagged successfully', blogHidden, blogDeleted, flagCount, authorBanned: true, authorId, flaggedPostsCount: authorFlaggedCount });
      }
    }
    res.status(201).json({ success: true, data: savedFlag, message: 'Blog flagged successfully', blogHidden, blogDeleted, flagCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to flag blog', error: err.message });
  }
};

exports.getFlagsByBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;
    const flags = await Flag.find({ blog_id: blogId }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: flags, count: flags.length, message: `Flags for blog ID ${blogId} retrieved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve flags by blog ID', error: err.message });
  }
};

exports.getFlagsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const flags = await Flag.find({ flagged_by: userId }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: flags, count: flags.length, message: `Flags created by user ID ${userId} retrieved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve flags by user', error: err.message });
  }
};

exports.removeFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const flag = await Flag.findById(id);
    if (!flag) return res.status(404).json({ success: false, message: 'Flag not found' });
    const blogId = flag.blog_id;
    await flag.deleteOne();
    const remainingFlags = await Flag.countDocuments({ blog_id: blogId });
    let blogUnhidden = false;
    if (remainingFlags === 0) {
      const blog = await Blog.findById(blogId);
      if (blog && blog.status === 'hidden') {
        blog.status = 'Đã xuất bản';
        await blog.save();
        blogUnhidden = true;
      }
    }
    res.status(200).json({ success: true, message: `Flag with ID ${id} removed successfully`, blogUnhidden, remainingFlags, blogId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove flag', error: err.message });
  }
};

exports.getMostFlaggedBlogs = async (req, res) => {
  try {
    const flaggedBlogs = await Flag.aggregate([
      { $group: { _id: '$blog_id', flagCount: { $sum: 1 } } },
      { $sort: { flagCount: -1 } },
      { $lookup: { from: 'blogs', localField: '_id', foreignField: '_id', as: 'blog' } },
      { $unwind: '$blog' },
      { $project: { blogId: '$_id', title: '$blog.title', flagCount: 1 } }
    ]);
    res.status(200).json({ success: true, data: flaggedBlogs, message: 'Most flagged blogs retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve most flagged blogs', error: err.message });
  }
};

exports.clearBlogFlags = async (req, res) => {
  try {
    const { blogId } = req.params;
    const result = await Flag.deleteMany({ blog_id: blogId });
    res.status(200).json({ success: true, deletedCount: result.deletedCount, message: `Removed ${result.deletedCount || 0} flags from blog ID ${blogId}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear blog flags', error: err.message });
  }
};

exports.getBannedUsers = async (req, res) => {
  try {
    // Lấy user bị ban và có >=5 blog bị flag
    const bannedUsers = await User.aggregate([
      { $match: { status: 'banned' } },
      { $lookup: { from: 'blogs', localField: '_id', foreignField: 'author', as: 'blogs' } },
      { $unwind: '$blogs' },
      { $lookup: { from: 'flags', localField: 'blogs._id', foreignField: 'blog_id', as: 'flags' } },
      { $group: { _id: '$_id', email: { $first: '$email' }, role: { $first: '$role' }, status: { $first: '$status' }, flagged_posts_count: { $sum: { $cond: [{ $gt: [{ $size: '$flags' }, 0] }, 1, 0] } } } },
      { $match: { flagged_posts_count: { $gte: 5 } } },
      { $sort: { flagged_posts_count: -1 } }
    ]);
    res.status(200).json({ success: true, data: bannedUsers, count: bannedUsers.length, message: 'Banned users retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve banned users', error: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'banned') return res.status(400).json({ success: false, message: 'User is not currently banned' });
    user.status = 'active';
    await user.save();
    res.status(200).json({ success: true, data: { user_id: user._id, email: user.email, status: user.status }, message: `User ${userId} has been unbanned successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to unban user', error: err.message });
  }
}; 