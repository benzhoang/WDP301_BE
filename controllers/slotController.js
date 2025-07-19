const Slot = require("../models/slotModel");

exports.createSlot = async (req, res) => {
  try {
    const { start_time, end_time, label } = req.body;
    const slot = new Slot({ start_time, end_time, label });
    await slot.save();
    res.status(201).json({ success: true, slot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 