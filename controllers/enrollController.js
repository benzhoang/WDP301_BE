const Enroll = require("../models/enrollModel");
const User = require("../models/userModel");
const Program = require("../models/programModel");

exports.createEnroll = async (req, res) => {
  try {
    const { user, program, status, progress, completed_at } = req.body;
    const userExists = await User.findById(user);
    const programExists = await Program.findById(program);
    if (!userExists || !programExists) {
      return res.status(404).json({ success: false, error: "User or program not found" });
    }
    const enroll = new Enroll({ user, program, status, progress, completed_at });
    await enroll.save();
    res.status(201).json({ success: true, enroll });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllEnrolls = async (req, res) => {
  try {
    const enrolls = await Enroll.find().populate("user program");
    res.json({ success: true, data: enrolls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Kiểm tra trạng thái đăng ký của user cho một chương trình
exports.checkMyEnrollment = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.user;
    const { programId } = req.params;
    if (!userId || !programId) return res.status(400).json({ success: false, error: "User ID and Program ID are required" });
    const enroll = await Enroll.findOne({ user: userId, program: programId });
    res.json({ success: true, isEnrolled: !!enroll, enrollment: enroll });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Đánh dấu hoàn thành chương trình
exports.completeEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enroll = await Enroll.findByIdAndUpdate(id, { status: "completed", completed_at: new Date() }, { new: true });
    res.json({ success: true, data: enroll });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Xóa đăng ký của user cho một chương trình
exports.deleteMyEnrollment = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.user;
    const { programId } = req.params;
    if (!userId || !programId) return res.status(400).json({ success: false, error: "User ID and Program ID are required" });
    const enroll = await Enroll.findOneAndDelete({ user: userId, program: programId });
    res.json({ success: true, message: "Enrollment deleted", data: enroll });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy tất cả đăng ký của user
exports.getEnrollmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const enrolls = await Enroll.find({ user: userId }).populate("program");
    res.json({ success: true, data: enrolls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy tất cả đăng ký của chương trình
exports.getEnrollmentsByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const enrolls = await Enroll.find({ program: programId }).populate("user");
    res.json({ success: true, data: enrolls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 