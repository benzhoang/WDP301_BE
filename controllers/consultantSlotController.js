const ConsultantSlot = require("../models/consultantSlotModel");
const Consultant = require("../models/consultantModel");

exports.createConsultantSlot = async (req, res) => {
  try {
    const { consultant, day_of_week, start_time, end_time } = req.body;
    const consultantExists = await Consultant.findById(consultant);
    if (!consultantExists) {
      return res.status(404).json({ success: false, error: "Consultant not found" });
    }
    const slot = new ConsultantSlot({ consultant, day_of_week, start_time, end_time });
    await slot.save();
    res.status(201).json({ success: true, slot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllConsultantSlots = async (req, res) => {
  try {
    const slots = await ConsultantSlot.find().populate("consultant");
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 