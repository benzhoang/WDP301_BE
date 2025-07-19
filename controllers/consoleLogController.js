const ConsoleLog = require("../models/consoleLogModel");
const User = require("../models/userModel");

exports.createConsoleLog = async (req, res) => {
  try {
    const { user, action, message, level, created_at } = req.body;
    let userExists = null;
    if (user) userExists = await User.findById(user);
    if (user && !userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const log = new ConsoleLog({ user, action, message, level, created_at });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllConsoleLogs = async (req, res) => {
  try {
    const logs = await ConsoleLog.find().populate("user");
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 