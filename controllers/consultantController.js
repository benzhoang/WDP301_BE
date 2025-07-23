const Consultant = require('../models/consultantModel');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const ConsultantSlot = require('../models/consultantSlotModel');

exports.getAllConsultants = async (req, res) => {
  try {
    const consultants = await Consultant.find();
    const users = await User.find();
    const profiles = await Profile.find();
    const consultantSlots = await ConsultantSlot.find();

    const userMap = new Map(users.filter(u => u._id).map(u => [u._id.toString(), u]));
    const profileMap = new Map(profiles.filter(p => p.user_id).map(p => [p.user_id.toString(), p]));

    // Map consultantId to slots
    const slotsMap = new Map();
    consultantSlots.forEach(slot => {
      const cid = slot.consultant?.toString();
      if (!cid) return;
      if (!slotsMap.has(cid)) slotsMap.set(cid, []);
      slotsMap.get(cid).push({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time
      });
    });

    const result = consultants.map(c => {
      const uid = c.user_id?.toString();
      const cid = c._id?.toString();
      const user = uid ? userMap.get(uid) : null;
      const profile = uid ? profileMap.get(uid) : null;
      const available_slots = cid ? slotsMap.get(cid) || [] : [];
      return {
        id_consultant: c._id,
        google_meet_link: c.google_meet_link,
        certification: c.certification,
        speciality: c.speciality,
        user_id: c.user_id,
        user,
        profile,
        available_slots
      };
    });
    res.status(200).json({
      success: true,
      data: {
        totalConsultants: consultants.length,
        consultants: result
      },
      message: 'Consultants retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultants', error: err.message });
  }
};

exports.getConsultantById = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    const user = await User.findById(consultant.user_id);
    const profile = await Profile.findOne({ user_id: consultant.user_id });
    const consultantSlots = await ConsultantSlot.find({ consultant: consultant._id });
    const available_slots = consultantSlots.map(slot => ({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time
    }));
    res.status(200).json({
      success: true,
      data: {
        id_consultant: consultant._id,
        google_meet_link: consultant.google_meet_link,
        certification: consultant.certification,
        speciality: consultant.speciality,
        user_id: consultant.user_id,
        user,
        profile,
        available_slots
      },
      message: 'Consultant retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultant', error: err.message });
  }
};

exports.createConsultant = async (req, res) => {
  try {
    const { user_id, google_meet_link, certification, speciality } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required' });
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const consultant = new Consultant({ user_id, google_meet_link, certification, speciality });
    await consultant.save();
    res.status(201).json({ success: true, data: consultant, message: 'Consultant created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create consultant', error: err.message });
  }
};

exports.updateConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const { google_meet_link, certification, speciality } = req.body;
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    if (google_meet_link !== undefined) consultant.google_meet_link = google_meet_link;
    if (certification !== undefined) consultant.certification = certification;
    if (speciality !== undefined) consultant.speciality = speciality;
    await consultant.save();
    res.status(200).json({ success: true, data: consultant, message: 'Consultant updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update consultant', error: err.message });
  }
};

exports.deleteConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    await consultant.deleteOne();
    res.status(200).json({ success: true, message: 'Consultant deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete consultant', error: err.message });
  }
};

exports.searchConsultantsByName = async (req, res) => {
  try {
    const { consultantName } = req.params;
    if (!consultantName) return res.status(400).json({ success: false, message: 'Search name is required' });
    const profiles = await Profile.find({ name: { $regex: consultantName, $options: 'i' } });
    const userIds = profiles.map(p => p.user_id.toString());
    const consultants = await Consultant.find({ user_id: { $in: userIds } });
    const users = await User.find({ _id: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const result = consultants.map(c => ({ ...c.toObject(), user: userMap.get(c.user_id.toString()), profile: profileMap.get(c.user_id.toString()) }));
    res.status(200).json({ success: true, data: result, message: `Found ${result.length} consultants matching "${consultantName}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search consultants by name', error: err.message });
  }
};

exports.getConsultantIdByUserId = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
    const consultant = await Consultant.findOne({ user_id: userId });
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found for this user', data: null });
    res.status(200).json({ success: true, data: { consultant_id: consultant._id, user_id: consultant.user_id }, message: 'Consultant ID retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultant ID', error: err.message });
  }
};

exports.getConsultantIdByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
    const consultant = await Consultant.findOne({ user_id: user._id });
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found for this user', data: null });
    res.status(200).json({ success: true, data: { consultant_id: consultant._id, user_id: consultant.user_id }, message: 'Consultant ID retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultant ID', error: err.message });
  }
}; 