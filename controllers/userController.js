const User = require("../models/userModel");
const Profile = require("../models/profileModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, name, password, role, social_provider, status } = req.body;
    const user = new User({ email, name, password, role, social_provider, status });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Lấy thông tin user + profile cho user hiện tại
exports.getUserProfileCombined = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, error: "User ID is required" });
    const user = await User.findById(userId).select("-password");
    const profile = await Profile.findOne({ user: userId });
    res.json({
      success: true,
      data: {
        user,
        profile,
        hasProfile: !!profile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cập nhật đồng thời user + profile
exports.updateUserProfileCombined = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, error: "User ID is required" });
    const { email, role, status, img_link, name, bio_json, date_of_birth, job } = req.body;
    const userUpdate = {};
    if (email) userUpdate.email = email;
    if (role) userUpdate.role = role;
    if (status) userUpdate.status = status;
    if (img_link) userUpdate.img_link = img_link;
    const user = await User.findByIdAndUpdate(userId, userUpdate, { new: true });
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = new Profile({ user: userId, name, bio_json, date_of_birth, job });
    } else {
      if (name) profile.name = name;
      if (bio_json) profile.bio_json = bio_json;
      if (date_of_birth) profile.date_of_birth = date_of_birth;
      if (job) profile.job = job;
    }
    await profile.save();
    res.json({
      success: true,
      data: { user, profile, hasProfile: true }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Xóa mềm user (soft delete)
exports.deleteUserCascade = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, error: "User ID is required" });
    const user = await User.findByIdAndUpdate(userId, { status: "inactive" }, { new: true });
    const profile = await Profile.findOneAndDelete({ user: userId });
    res.json({
      success: true,
      message: "User deactivated and profile deleted (soft delete)",
      deactivatedData: { user, profile, softDeleted: true }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Thêm các hàm khác như login, update, delete... nếu cần 