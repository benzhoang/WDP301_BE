const Assessment = require("../models/assessmentModel");
const User = require("../models/userModel");

exports.createAssessment = async (req, res) => {
  try {
    const { user, type, score, result, details, taken_at } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const assessment = new Assessment({ user, type, score, result, details, taken_at });
    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("user");
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 