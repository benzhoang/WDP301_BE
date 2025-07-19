const Consultant = require("../models/consultantModel");
const User = require("../models/userModel");

exports.createConsultant = async (req, res) => {
  try {
    const { user, google_meet_link, certification, speciality } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const consultant = new Consultant({ user, google_meet_link, certification, speciality });
    await consultant.save();
    res.status(201).json({ success: true, consultant });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllConsultants = async (req, res) => {
  try {
    const consultants = await Consultant.find().populate("user");
    res.json({ success: true, data: consultants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 