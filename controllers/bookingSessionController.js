const BookingSession = require("../models/bookingSessionModel");
const User = require("../models/userModel");

exports.createBookingSession = async (req, res) => {
  try {
    const { member, consultant, slot, booking_date, status, notes, google_meet_link } = req.body;
    const memberUser = await User.findById(member);
    const consultantUser = await User.findById(consultant);
    if (!memberUser || !consultantUser) {
      return res.status(404).json({ success: false, error: "Member or consultant not found" });
    }
    const bookingSession = new BookingSession({ member, consultant, slot, booking_date, status, notes, google_meet_link });
    await bookingSession.save();
    res.status(201).json({ success: true, bookingSession });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllBookingSessions = async (req, res) => {
  try {
    const sessions = await BookingSession.find().populate("member consultant");
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy tất cả booking của một member
exports.getBookingSessionsByMember = async (req, res) => {
  try {
    const memberId = req.user?.userId || req.query.member;
    if (!memberId) return res.status(400).json({ success: false, error: "Member ID is required" });
    const sessions = await BookingSession.find({ member: memberId }).populate("consultant");
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy tất cả booking của một consultant
exports.getBookingSessionsByConsultant = async (req, res) => {
  try {
    const consultantId = req.user?.userId || req.query.consultant;
    if (!consultantId) return res.status(400).json({ success: false, error: "Consultant ID is required" });
    const sessions = await BookingSession.find({ consultant: consultantId }).populate("member");
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật trạng thái và link Google Meet
exports.updateBookingSessionStatusAndLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, google_meet_link } = req.body;
    const update = {};
    if (status) update.status = status;
    if (google_meet_link) update.google_meet_link = google_meet_link;
    const session = await BookingSession.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Xóa booking session
exports.deleteBookingSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await BookingSession.findByIdAndDelete(id);
    res.json({ success: true, message: "Booking session deleted", data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 