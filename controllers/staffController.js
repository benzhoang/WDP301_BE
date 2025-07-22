const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Program = require('../models/programModel');
const Flag = require('../models/flagModel');

exports.getAllStaff = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';
    const staffUsers = await User.find({ role: { $in: ['admin', 'staff', 'manager'] } });
    const profiles = await Profile.find({ user_id: { $in: staffUsers.map(u => u._id) } });
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));
    const result = staffUsers.map(u => {
      const staffData = { ...u.toObject(), profile: profileMap.get(u._id.toString()) || null };
      if (!isAdmin) delete staffData.password;
      return staffData;
    });
    res.status(200).json({ success: true, data: result, count: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve staff', error: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { email, password, role, status = 'active', name, bio_json, date_of_birth, job } = req.body;
    if (!email || !password || !role) return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    if (!['staff', 'manager', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Role must be staff, manager, or admin for staff creation' });
    if (!['active', 'inactive', 'banned'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be active, inactive, or banned' });
    const existed = await User.findOne({ email });
    if (existed) return res.status(409).json({ success: false, message: 'Email already exists' });
    const user = new User({ email, password, role, status });
    await user.save();
    let profile = null;
    if (name || bio_json || date_of_birth || job) {
      profile = new Profile({ user_id: user._id, name, bio_json: bio_json ? (typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json)) : undefined, date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined, job });
      await profile.save();
    }
    res.status(201).json({ success: true, data: { ...user.toObject(), profile }, message: `Staff ${role} created successfully with email: ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create staff', error: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { email, password, role, status, name, bio_json, date_of_birth, job } = req.body;
    const user = await User.findById(staffId);
    if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
    if (!['admin', 'staff', 'manager'].includes(user.role)) return res.status(400).json({ success: false, message: 'User is not a staff member' });
    if (email !== undefined) user.email = email;
    if (password !== undefined && password.trim() !== "") user.password = password;
    if (role !== undefined) {
      if (!['staff', 'manager', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Role must be staff, manager, or admin' });
      user.role = role;
    }
    if (status !== undefined) {
      if (!['active', 'inactive', 'banned'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be active, inactive, or banned' });
      user.status = status;
    }
    if (email) {
      const duplicate = await User.findOne({ email });
      if (duplicate && duplicate._id.toString() !== staffId) return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    await user.save();
    let profile = await Profile.findOne({ user_id: staffId });
    if (name !== undefined || bio_json !== undefined || date_of_birth !== undefined || job !== undefined) {
      if (!profile) profile = new Profile({ user_id: staffId });
      if (name !== undefined) profile.name = name;
      if (bio_json !== undefined) profile.bio_json = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
      if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
      if (job !== undefined) profile.job = job;
      await profile.save();
    }
    res.status(200).json({ success: true, data: { user, profile }, message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update staff', error: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const user = await User.findById(staffId);
    if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
    if (!['admin', 'staff', 'manager'].includes(user.role)) return res.status(400).json({ success: false, message: 'User is not a staff member' });
    const programCount = await Program.countDocuments({ creator: user._id });
    const flagCount = await Flag.countDocuments({ user: user._id });
    const totalReferences = programCount + flagCount;
    if (totalReferences > 0) {
      user.status = 'inactive';
      await user.save();
      return res.status(200).json({ success: true, message: `Staff has ${totalReferences} reference(s). User status set to inactive instead of deletion.`, data: { staff_id: staffId, action: 'status_changed_to_inactive', references: { programCount, flagCount, totalReferences } } });
    } else {
      await Profile.deleteOne({ user_id: staffId });
      await User.deleteOne({ _id: staffId });
      return res.status(200).json({ success: true, message: 'Staff and all related data deleted successfully', data: { staff_id: staffId, action: 'completely_deleted' } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete staff', error: err.message });
  }
};

exports.searchStaffByName = async (req, res) => {
  try {
    const { staffName } = req.params;
    if (!staffName || staffName.trim() === '') return res.status(400).json({ success: false, message: 'Staff name parameter is required' });
    const usersByEmail = await User.find({ role: { $in: ['admin', 'staff', 'manager'] }, email: { $regex: staffName, $options: 'i' } });
    const profilesByName = await Profile.find({ name: { $regex: staffName, $options: 'i' } });
    const userIds = new Set([...usersByEmail.map(u => u._id.toString()), ...profilesByName.map(p => p.user_id.toString())]);
    const result = [];
    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (user && ['admin', 'staff', 'manager'].includes(user.role)) {
        const profile = await Profile.findOne({ user_id: userId });
        result.push({ ...user.toObject(), profile: profile || null });
      }
    }
    res.status(200).json({ success: true, data: result, count: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search staff by name', error: err.message });
  }
};

exports.getStaffStatistics = async (req, res) => {
  try {
    const totalStaff = await User.countDocuments({ role: { $in: ['admin', 'consultant'] } });
    const activeStaff = await User.countDocuments({ role: { $in: ['admin', 'consultant'] }, status: 'active' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const consultantCount = await User.countDocuments({ role: 'consultant' });
    res.status(200).json({ success: true, data: { totalStaff, activeStaff, inactiveStaff: totalStaff - activeStaff, adminCount, consultantCount }, message: 'Staff statistics retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve staff statistics', error: err.message });
  }
}; 