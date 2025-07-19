const Profile = require("../models/profileModel");
const User = require("../models/userModel");

exports.createProfile = async (req, res) => {
  try {
    const { name, bio_json, date_of_birth, job } = req.body;
    const userId = req.body.user || req.user?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }
    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    // Kiểm tra profile đã tồn tại
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(409).json({ success: false, error: "Profile already exists for this user" });
    }
    // Validate JSON nếu có
    if (bio_json) {
      try { JSON.parse(bio_json); } catch (e) {
        return res.status(400).json({ success: false, error: "Invalid bio JSON format" });
      }
    }
    // Tạo profile mới
    const newProfile = new Profile({
      user: userId,
      name: name || null,
      bio_json: bio_json || null,
      date_of_birth: date_of_birth || null,
      job: job || null,
    });
    const savedProfile = await newProfile.save();
    res.status(201).json({ success: true, message: "Profile created successfully", profile: savedProfile });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ success: false, error: "Failed to create profile.", details: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.body.user || req.user?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }
    const profile = await Profile.findOne({ user: userId }).populate("user");
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    res.status(200).json({ success: true, message: "Profile retrieved successfully", profile });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve profile.", details: error.message });
  }
}; 