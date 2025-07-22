const BookingSession = require('../models/bookingSessionModel');
const User = require('../models/userModel');
const Slot = require('../models/slotModel');
const Consultant = require('../models/consultantModel');

exports.getAllBookingSessions = async (req, res) => {
  try {
    const bookings = await BookingSession.find();
    res.status(200).json({ success: true, data: bookings, message: 'Lấy danh sách lịch hẹn thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách lịch hẹn', error: err.message });
  }
};

exports.getBookingSessionsByMember = async (req, res) => {
  try {
    const memberId = req.user?.userId || req.user?._id || req.user?.id;
    const bookings = await BookingSession.find({ member_id: memberId });
    res.status(200).json({ success: true, data: bookings, count: bookings.length, message: 'Lấy danh sách lịch hẹn thành công' });
  } catch (err) {
    res.status(500).json({ success: false, data: [], count: 0, message: err.message || 'Không thể lấy danh sách lịch hẹn' });
  }
};

exports.createBookingSession = async (req, res) => {
  try {
    const { consultant_id, slot_id, booking_date } = req.body;
    const member_id = req.user?.userId || req.user?._id || req.user?.id;
    // Giới hạn 3 booking đang diễn ra
    const ongoingCount = await BookingSession.countDocuments({ member_id, status: { $in: ['Đang chờ xác nhận', 'Đã xác nhận'] } });
    if (ongoingCount >= 3) {
      return res.status(400).json({ success: false, message: 'Bạn đã đạt giới hạn 3 cuộc hẹn đang diễn ra' });
    }
    // Kiểm tra trùng slot/consultant/date
    const exists = await BookingSession.findOne({ consultant_id, slot_id, booking_date });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Chuyên gia này đã được đặt cho khung giờ này vào ngày đã chọn' });
    }
    // Kiểm tra member đã có booking ngày này chưa
    const memberBooking = await BookingSession.findOne({ member_id, booking_date, status: { $in: ['Đang chờ xác nhận', 'Đã xác nhận'] } });
    if (memberBooking) {
      return res.status(409).json({ success: false, message: 'Bạn đã có một cuộc hẹn được lên lịch cho ngày này' });
    }
    // Tạo booking mới
    const booking = new BookingSession({ consultant_id, member_id, slot_id, booking_date, status: 'Đang chờ xác nhận' });
    await booking.save();
    res.status(201).json({ success: true, data: booking, message: 'Đặt lịch hẹn thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Không thể tạo lịch hẹn' });
  }
};

exports.deleteBookingSession = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingSession.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    await booking.deleteOne();
    res.status(200).json({ success: true, message: 'Xóa lịch hẹn thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể xóa lịch hẹn', error: err.message });
  }
};

exports.getScheduledBookingSessions = async (req, res) => {
  try {
    const memberId = req.user?.userId || req.user?._id || req.user?.id;
    const bookings = await BookingSession.find({ member_id: memberId, status: { $in: ['Đang chờ xác nhận', 'Xác nhận thành công'] } });
    res.status(200).json({ success: true, data: bookings, count: bookings.length, message: 'Lấy danh sách lịch hẹn đã lên lịch thành công' });
  } catch (err) {
    res.status(500).json({ success: false, data: [], count: 0, message: err.message || 'Không thể lấy danh sách lịch hẹn đã lên lịch' });
  }
};

exports.updateBookingSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { consultant_id, slot_id, booking_date, status, notes, google_meet_link } = req.body;
    const booking = await BookingSession.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking session not found' });
    if (consultant_id !== undefined) booking.consultant_id = consultant_id;
    if (slot_id !== undefined) booking.slot_id = slot_id;
    if (booking_date !== undefined) booking.booking_date = booking_date;
    if (status !== undefined) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    if (google_meet_link !== undefined) booking.google_meet_link = google_meet_link;
    await booking.save();
    res.status(200).json({ success: true, data: booking, message: 'Booking session updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking session', error: err.message });
  }
};

exports.getDetailedBookingSessionsByConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const bookings = await BookingSession.find({ consultant_id: consultantId });
    res.status(200).json({ success: true, data: bookings, count: bookings.length, message: 'Lấy thông tin chi tiết lịch hẹn thành công' });
  } catch (err) {
    res.status(500).json({ success: false, data: [], count: 0, message: err.message || 'Không thể lấy thông tin chi tiết lịch hẹn' });
  }
};

exports.updateBookingSessionStatusAndLink = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, google_meet_link } = req.body;
    const booking = await BookingSession.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking session not found' });
    if (status !== undefined) booking.status = status;
    if (google_meet_link !== undefined) booking.google_meet_link = google_meet_link;
    await booking.save();
    res.status(200).json({ success: true, data: booking, message: 'Booking session status/link updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking session status/link', error: err.message });
  }
};

exports.getBookingSessionsByConsultant = async (req, res) => {
  try {
    // Lấy consultant_id từ token hoặc query hoặc body
    const consultantId = req.user?.userId || req.user?._id || req.user?.id || req.query.consultant_id || req.body.consultant_id;
    if (!consultantId) return res.status(400).json({ success: false, message: 'Consultant ID is required' });
    const bookings = await BookingSession.find({ consultant_id: consultantId });
    res.status(200).json({ success: true, data: bookings, count: bookings.length, message: 'Lấy danh sách lịch hẹn của chuyên gia thành công' });
  } catch (err) {
    res.status(500).json({ success: false, data: [], count: 0, message: err.message || 'Không thể lấy danh sách lịch hẹn của chuyên gia' });
  }
}; 