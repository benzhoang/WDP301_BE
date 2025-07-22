const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Assessment = require('../models/assessmentModel');
const Blog = require('../models/blogModel');
const BookingSession = require('../models/bookingSessionModel');
const SurveyResponse = require('../models/surveyResponseModel');

exports.getAllMembers = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';
    const members = await User.find({ role: 'member' });
    const profiles = await Profile.find({ user_id: { $in: members.map(u => u._id) } });
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));
    const result = members.map(u => {
      const memberData = { ...u.toObject(), profile: profileMap.get(u._id.toString()) || null };
      if (!isAdmin) delete memberData.password;
      return memberData;
    });
    res.status(200).json({ success: true, data: result, count: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve members', error: err.message });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    const user = await User.findOne({ _id: memberId, role: 'member' });
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
    const profile = await Profile.findOne({ user_id: user._id });
    res.status(200).json({ success: true, data: { ...user.toObject(), profile: profile || null } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve member', error: err.message });
  }
};

exports.getFullMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    const user = await User.findOne({ _id: memberId, role: 'member' });
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
    const profile = await Profile.findOne({ user_id: user._id });
    const assessments = await Assessment.find({ user: user._id });
    res.status(200).json({
      success: true,
      data: {
        user: { _id: user._id, email: user.email, role: user.role, status: user.status, img_link: user.img_link, createdAt: user.createdAt },
        profile: profile || null,
        assessments,
        assessment_count: assessments.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve member', error: err.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { email, password, status = 'active', name, bio_json, date_of_birth, job } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    if (!['active', 'inactive', 'banned'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be active, inactive, or banned' });
    const existed = await User.findOne({ email });
    if (existed) return res.status(409).json({ success: false, message: 'Email already exists' });
    const user = new User({ email, password, role: 'member', status });
    await user.save();
    let profile = null;
    if (name || bio_json || date_of_birth || job) {
      profile = new Profile({ user_id: user._id, name, bio_json: bio_json ? (typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json)) : undefined, date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined, job });
      await profile.save();
    }
    res.status(201).json({ success: true, data: { user, profile }, message: 'Member created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create member', error: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { email, password, status, name, bio_json, date_of_birth, job } = req.body;
    const user = await User.findById(memberId);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
    if (user.role !== 'member') return res.status(400).json({ success: false, message: 'User is not a member' });
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (status !== undefined) {
      if (!['active', 'inactive', 'banned'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be active, inactive, or banned' });
      user.status = status;
    }
    if (email) {
      const duplicate = await User.findOne({ email });
      if (duplicate && duplicate._id.toString() !== memberId) return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    await user.save();
    let profile = await Profile.findOne({ user_id: memberId });
    if (name !== undefined || bio_json !== undefined || date_of_birth !== undefined || job !== undefined) {
      if (!profile) {
        profile = new Profile({ user_id: memberId });
      }
      if (name !== undefined) profile.name = name;
      if (bio_json !== undefined) profile.bio_json = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
      if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
      if (job !== undefined) profile.job = job;
      await profile.save();
    }
    res.status(200).json({ success: true, data: { user, profile }, message: 'Member updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update member', error: err.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const user = await User.findById(memberId);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
    if (user.role !== 'member') return res.status(400).json({ success: false, message: 'User is not a member' });
    // Kiểm tra liên kết
    const blogCount = await Blog.countDocuments({ author_id: memberId });
    const bookingCount = await BookingSession.countDocuments({ member_id: memberId });
    const surveyCount = await SurveyResponse.countDocuments({ user: memberId });
    const assessmentCount = await Assessment.countDocuments({ user: memberId });
    const totalReferences = blogCount + bookingCount + surveyCount + assessmentCount;
    if (totalReferences > 0) {
      user.status = 'inactive';
      await user.save();
      return res.status(200).json({ success: true, message: `Member has ${totalReferences} reference(s). User status set to inactive instead of deletion.`, data: { member_id: memberId, action: 'status_changed_to_inactive', references: { blogCount, bookingCount, surveyCount, assessmentCount, totalReferences } } });
    } else {
      await Profile.deleteOne({ user_id: memberId });
      await User.deleteOne({ _id: memberId });
      return res.status(200).json({ success: true, message: 'Member and all related data deleted successfully', data: { member_id: memberId, action: 'completely_deleted' } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete member', error: err.message });
  }
};

exports.searchMembersByName = async (req, res) => {
  try {
    const { memberName } = req.params;
    if (!memberName || memberName.trim() === '') return res.status(400).json({ success: false, message: 'Member name parameter is required' });
    const usersByEmail = await User.find({ role: 'member', email: { $regex: memberName, $options: 'i' } });
    const profilesByName = await Profile.find({ name: { $regex: memberName, $options: 'i' } });
    const userIds = new Set([...usersByEmail.map(u => u._id.toString()), ...profilesByName.map(p => p.user_id.toString())]);
    const result = [];
    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (user && user.role === 'member') {
        const profile = await Profile.findOne({ user_id: userId });
        result.push({ ...user.toObject(), profile: profile || null });
      }
    }
    res.status(200).json({ success: true, data: result, count: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search members by name', error: err.message });
  }
};

exports.getMemberStatistics = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', status: 'active' });
    const inactiveMembers = await User.countDocuments({ role: 'member', status: 'inactive' });
    const bannedMembers = await User.countDocuments({ role: 'member', status: 'banned' });
    const membersWithProfiles = await Profile.countDocuments({ name: { $exists: true, $ne: null } });
    res.status(200).json({ success: true, data: { totalMembers, activeMembers, inactiveMembers, bannedMembers, membersWithProfiles }, message: 'Member statistics retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get member statistics', error: err.message });
  }
}; 