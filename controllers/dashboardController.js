const User = require('../models/userModel');
const BookingSession = require('../models/bookingSessionModel');
const Enroll = require('../models/enrollModel');
const Consultant = require('../models/consultantModel');

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

exports.getDashboardStats = async (req, res) => {
  try {
    const { start, end } = getMonthRange();
    const totalMonthlyCourseEnrollment = await Enroll.distinct('user', { start_at: { $gte: start, $lte: end } }).then(arr => arr.length);
    const monthlyCreatedMember = await User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: 'member' });
    const memberActiveCount = await User.countDocuments({ status: 'active', role: 'member' });
    const totalMonthlyBookingSession = await BookingSession.countDocuments({ booking_date: { $gte: start, $lte: end } });
    const totalConsultants = await Consultant.countDocuments();
    res.status(200).json({
      success: true,
      data: {
        memberStats: { totalMonthlyCourseEnrollment, monthlyCreatedMember, memberActiveCount, totalMonthlyBookingSession },
        consultantStats: { totalConsultants }
      },
      message: 'Dashboard statistics retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics', error: err.message });
  }
};

exports.getDetailedDashboard = async (req, res) => {
  let { startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
    }
    const totalMonthlyCourseEnrollment = await Enroll.distinct('user', { start_at: { $gte: startDate, $lte: endDate } }).then(arr => arr.length);
    const monthlyCreatedMember = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, role: 'member' });
    const memberActiveCount = await User.countDocuments({ status: 'active', role: 'member', createdAt: { $gte: startDate, $lte: endDate } });
    const totalMonthlyBookingSession = await BookingSession.countDocuments({ booking_date: { $gte: startDate, $lte: endDate } });
    const total = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    const active = await User.countDocuments({ status: 'active', createdAt: { $gte: startDate, $lte: endDate } });
    const inactive = await User.countDocuments({ status: 'inactive', createdAt: { $gte: startDate, $lte: endDate } });
    const banned = await User.countDocuments({ status: 'banned', createdAt: { $gte: startDate, $lte: endDate } });
    const roleDistribution = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const totalBooking = await BookingSession.countDocuments({ booking_date: { $gte: startDate, $lte: endDate } });
    const confirmed = await BookingSession.countDocuments({ booking_date: { $gte: startDate, $lte: endDate }, status: 'Lên lịch' });
    const completed = await BookingSession.countDocuments({ booking_date: { $gte: startDate, $lte: endDate }, status: 'Hoàn thành' });
    const cancelled = await BookingSession.countDocuments({ booking_date: { $gte: startDate, $lte: endDate }, status: 'Đã huỷ' });
    res.status(200).json({
      success: true,
      data: {
        totalMonthlyCourseEnrollment,
        monthlyCreatedMember,
        memberActiveCount,
        totalMonthlyBookingSession,
        userStats: { total, active, inactive, banned, roleDistribution },
        bookingStats: { total: totalBooking, confirmed, completed, cancelled },
        dateRange: { startDate, endDate }
      },
      message: 'Detailed dashboard data retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve detailed dashboard data', error: err.message });
  }
};

exports.getMonthlyCourseEnrollment = async (req, res) => {
  try {
    const { start, end } = getMonthRange();
    const count = await Enroll.distinct('user', { start_at: { $gte: start, $lte: end } }).then(arr => arr.length);
    res.status(200).json({ success: true, data: { totalMonthlyCourseEnrollment: count }, message: 'Monthly course enrollment count retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve monthly course enrollment', error: err.message });
  }
};

exports.getMonthlyCreatedMembers = async (req, res) => {
  try {
    const { start, end } = getMonthRange();
    const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: 'member' });
    res.status(200).json({ success: true, data: { monthlyCreatedMember: count }, message: 'Monthly created members count retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve monthly created members', error: err.message });
  }
};

exports.getActiveMembers = async (req, res) => {
  try {
    const count = await User.countDocuments({ status: 'active', role: 'member' });
    res.status(200).json({ success: true, data: { memberActiveCount: count }, message: 'Active members count retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve active members', error: err.message });
  }
};

exports.getMonthlyBookingSessions = async (req, res) => {
  try {
    const { start, end } = getMonthRange();
    const count = await BookingSession.countDocuments({ booking_date: { $gte: start, $lte: end } });
    res.status(200).json({ success: true, data: { totalMonthlyBookingSession: count }, message: 'Monthly booking sessions count retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve monthly booking sessions', error: err.message });
  }
};

exports.getConsultantDashboard = async (req, res) => {
  try {
    const count = await Consultant.countDocuments();
    res.status(200).json({ success: true, data: { totalConsultants: count }, message: 'Consultant dashboard statistics retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultant dashboard statistics', error: err.message });
  }
}; 