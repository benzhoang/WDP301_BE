const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

exports.createBooking = async (req, res) => {
  try {
    const { member, consultant, slot, booking_date, status, notes, google_meet_link } = req.body;
    // Kiểm tra member và consultant tồn tại
    const memberUser = await User.findById(member);
    const consultantUser = await User.findById(consultant);
    if (!memberUser || !consultantUser) {
      return res.status(404).json({ success: false, error: "Member or consultant not found" });
    }
    const booking = new Booking({ member, consultant, slot, booking_date, status, notes, google_meet_link });
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("member consultant");
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 