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

// Lấy tất cả slot theo consultantId
exports.getSlotsByConsultantId = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const slots = await ConsultantSlot.find({ consultant: consultantId }).populate("consultant");
    res.status(200).json({
      success: true,
      data: slots,
      count: slots.length,
      message: `Slots for consultant ID ${consultantId} retrieved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve slots by consultant ID",
      error: error.message,
    });
  }
};

// Tạo nhiều slot cho consultant
exports.createConsultantSlots = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const { slots } = req.body; // [{ day_of_week, start_time, end_time }]
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ success: false, message: "Invalid input. Required: slots array" });
    }
    const consultantExists = await Consultant.findById(consultantId);
    if (!consultantExists) {
      return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    const newSlots = slots.map(slotData => ({
      consultant: consultantId,
      day_of_week: slotData.day_of_week,
      start_time: slotData.start_time,
      end_time: slotData.end_time
    }));
    const savedSlots = await ConsultantSlot.insertMany(newSlots);
    res.status(201).json({
      success: true,
      data: {
        consultant_id: consultantId,
        slots_created: savedSlots,
        total_slots_created: savedSlots.length
      },
      message: `Successfully created ${savedSlots.length} slots for consultant ID ${consultantId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create consultant slots",
      error: error.message,
    });
  }
};

// Xóa toàn bộ slot của consultant
exports.deleteConsultantSlots = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const consultantExists = await Consultant.findById(consultantId);
    if (!consultantExists) {
      return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    const deleteResult = await ConsultantSlot.deleteMany({ consultant: consultantId });
    res.status(200).json({
      success: true,
      data: {
        consultant_id: consultantId,
        deleted_count: deleteResult.deletedCount || 0
      },
      message: `Successfully deleted all slots for consultant ID ${consultantId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete consultant slots",
      error: error.message,
    });
  }
};

// Cập nhật slot cho consultant theo ngày (xóa slot cũ theo ngày, tạo slot mới)
exports.updateConsultantSlots = async (req, res) => {
  try {
    const { consultant_id, daysofweek, slot } = req.body;
    if (!consultant_id || !daysofweek || !slot || !Array.isArray(slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input. Required: consultant_id, daysofweek, and slot array"
      });
    }
    const consultantExists = await Consultant.findById(consultant_id);
    if (!consultantExists) {
      return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    // Xóa slot cũ theo ngày
    const daysArray = Array.isArray(daysofweek) ? daysofweek : [daysofweek];
    await ConsultantSlot.deleteMany({ consultant: consultant_id, day_of_week: { $in: daysArray } });
    // Tạo slot mới
    const newConsultantSlots = [];
    for (const day of daysArray) {
      for (const slotObj of slot) {
        newConsultantSlots.push({
          consultant: consultant_id,
          day_of_week: day,
          start_time: slotObj.start_time,
          end_time: slotObj.end_time
        });
      }
    }
    const savedSlots = await ConsultantSlot.insertMany(newConsultantSlots);
    res.status(200).json({
      success: true,
      data: {
        consultant_id,
        days_updated: daysArray,
        slots_created: savedSlots,
        total_slots_created: savedSlots.length
      },
      message: `Successfully updated consultant slots for consultant ID ${consultant_id}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update consultant slots",
      error: error.message,
    });
  }
}; 