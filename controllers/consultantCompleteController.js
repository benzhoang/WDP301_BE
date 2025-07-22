const Consultant = require('../models/consultantModel');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const ConsultantSlot = require('../models/consultantSlotModel');
const BookingSession = require('../models/bookingSessionModel');

exports.getAllConsultantsComplete = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';
    const consultants = await Consultant.find();
    const users = await User.find({ _id: { $in: consultants.map(c => c.user_id) } });
    const profiles = await Profile.find({ user_id: { $in: consultants.map(c => c.user_id) } });
    const slots = await ConsultantSlot.find({ consultant: { $in: consultants.map(c => c._id) } });
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));
    const slotMap = new Map();
    slots.forEach(s => {
      const cid = s.consultant.toString();
      if (!slotMap.has(cid)) slotMap.set(cid, []);
      slotMap.get(cid).push({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time });
    });
    const result = consultants.map(c => {
      const user = userMap.get(c.user_id.toString());
      const profile = profileMap.get(c.user_id.toString());
      const availability_slots = slotMap.get(c._id.toString()) || [];
      const data = {
        ...c.toObject(),
        user: user ? { ...user.toObject(), password: isAdmin ? user.password : undefined } : null,
        profile: profile || null,
        availability_slots
      };
      if (!isAdmin && data.user) delete data.user.password;
      return data;
    });
    res.status(200).json({ success: true, data: { totalConsultants: consultants.length, consultants: result } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complete consultant data', error: err.message });
  }
};

exports.getConsultantCompleteById = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    const user = await User.findById(consultant.user_id);
    const profile = await Profile.findOne({ user_id: consultant.user_id });
    const slots = await ConsultantSlot.find({ consultant: consultantId });
    const availability_slots = slots.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
    res.status(200).json({
      success: true,
      data: {
        ...consultant.toObject(),
        user: user ? { ...user.toObject(), password: undefined } : null,
        profile: profile || null,
        availability_slots
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complete consultant data', error: err.message });
  }
};

exports.createConsultantComplete = async (req, res) => {
  try {
    const { email, password, status = 'active', role = 'consultant', img_link, google_meet_link, certification, speciality, name, bio_json, date_of_birth, job, availability_slots = [] } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    const existed = await User.findOne({ email });
    if (existed) return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    const user = new User({ email, password, role, status, img_link });
    await user.save();
    const consultant = new Consultant({ user_id: user._id, google_meet_link, certification, speciality });
    await consultant.save();
    let profile = null;
    if (name || bio_json || date_of_birth || job) {
      profile = new Profile({ user_id: user._id, name, bio_json: bio_json ? (typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json)) : undefined, date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined, job });
      await profile.save();
    }
    const createdSlots = [];
    for (const slotData of availability_slots) {
      const { day_of_week, start_time, end_time } = slotData;
      const slot = new ConsultantSlot({ consultant: consultant._id, day_of_week, start_time, end_time });
      await slot.save();
      createdSlots.push({ day_of_week, start_time, end_time });
    }
    res.status(201).json({ success: true, data: { ...consultant.toObject(), user: user.toObject(), profile, availability_slots: createdSlots }, message: `Consultant created successfully with email: ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create complete consultant', error: err.message });
  }
};

exports.updateConsultantComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, email, img_link, google_meet_link, certification, speciality, name, bio_json, date_of_birth, job, availability_slots } = req.body;
    const consultant = await Consultant.findById(id);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    const user = await User.findById(consultant.user_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (google_meet_link !== undefined) consultant.google_meet_link = google_meet_link;
    if (certification !== undefined) consultant.certification = certification;
    if (speciality !== undefined) consultant.speciality = speciality;
    await consultant.save();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (email !== undefined) user.email = email;
    if (img_link !== undefined) user.img_link = img_link;
    await user.save();
    let profile = await Profile.findOne({ user_id: user._id });
    if (name !== undefined || bio_json !== undefined || date_of_birth !== undefined || job !== undefined) {
      if (!profile) profile = new Profile({ user_id: user._id });
      if (name !== undefined) profile.name = name;
      if (bio_json !== undefined) profile.bio_json = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
      if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
      if (job !== undefined) profile.job = job;
      await profile.save();
    }
    let updatedSlots = [];
    if (availability_slots !== undefined) {
      await ConsultantSlot.deleteMany({ consultant: consultant._id });
      for (const slotData of availability_slots) {
        const { day_of_week, start_time, end_time } = slotData;
        const slot = new ConsultantSlot({ consultant: consultant._id, day_of_week, start_time, end_time });
        await slot.save();
        updatedSlots.push({ day_of_week, start_time, end_time });
      }
    } else {
      const slots = await ConsultantSlot.find({ consultant: consultant._id });
      updatedSlots = slots.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
    }
    res.status(200).json({ success: true, data: { ...consultant.toObject(), user: user.toObject(), profile, availability_slots: updatedSlots }, message: 'Consultant updated successfully with complete profile and availability' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update complete consultant', error: err.message });
  }
};

exports.deleteConsultantComplete = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ success: false, message: 'Consultant not found' });
    const user = await User.findById(consultant.user_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const bookingCount = await BookingSession.countDocuments({ consultant: consultantId });
    if (bookingCount > 0) {
      user.status = 'inactive';
      await user.save();
      return res.status(200).json({ success: true, message: `Consultant has ${bookingCount} booking(s). User status set to inactive instead of deletion.`, data: { consultant_id: consultantId, action: 'status_changed_to_inactive', bookingCount } });
    } else {
      await ConsultantSlot.deleteMany({ consultant: consultantId });
      await Consultant.deleteOne({ _id: consultantId });
      await Profile.deleteOne({ user_id: user._id });
      await User.deleteOne({ _id: user._id });
      return res.status(200).json({ success: true, message: 'Consultant and all related data deleted successfully', data: { consultant_id: consultantId, action: 'completely_deleted' } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete complete consultant', error: err.message });
  }
};

exports.getConsultantAvailabilityByDay = async (req, res) => {
  try {
    const { consultantId, dayOfWeek } = req.params;
    const slots = await ConsultantSlot.find({ consultant: consultantId, day_of_week: dayOfWeek });
    const availability_slots = slots.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
    res.status(200).json({ success: true, data: { consultant_id: consultantId, day_of_week: dayOfWeek, availability_slots }, message: `Availability for ${dayOfWeek} retrieved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve consultant availability', error: err.message });
  }
};

exports.updateBookingSessionStatusAndLink = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, google_meet_link } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'Booking ID is required' });
    if (!status && !google_meet_link) return res.status(400).json({ success: false, message: 'At least one field (status or google_meet_link) must be provided' });
    const booking = await BookingSession.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking session not found' });
    if (status !== undefined) booking.status = status;
    if (google_meet_link !== undefined) booking.google_meet_link = google_meet_link;
    await booking.save();
    res.status(200).json({ success: true, data: booking, message: 'Booking session updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking session', error: err.message });
  }
}; 