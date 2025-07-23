const Enroll = require('../models/enrollModel');
const Content = require('../models/contentModel');

function parseProgress(progress) {
  try {
    return progress ? JSON.parse(progress) : [];
  } catch (err) {
    return [];
  }
}

exports.getAllEnrolls = async (req, res) => {
  try {
    const enrolls = await Enroll.find();
    const parsed = enrolls.map(e => ({ ...e.toObject(), progress: parseProgress(e.progress) }));
    res.status(200).json({ success: true, data: parsed, message: 'Enrollments retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve enrollments', error: err.message });
  }
};

exports.getEnrollmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const enrolls = await Enroll.find({ user_id: userId });
    const parsed = enrolls.map(e => ({ ...e.toObject(), progress: parseProgress(e.progress) }));
    res.status(200).json({ success: true, data: parsed, message: 'User enrollments retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user enrollments', error: err.message });
  }
};

exports.getEnrollmentsByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const enrolls = await Enroll.find({ program_id: programId });
    const parsed = enrolls.map(e => ({ ...e.toObject(), progress: parseProgress(e.progress) }));
    res.status(200).json({ success: true, data: parsed, message: 'Program enrollments retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve program enrollments', error: err.message });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const { userId, programId } = req.params;
    const enroll = await Enroll.findOne({ user_id: userId, program_id: programId });
    if (!enroll) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.status(200).json({ success: true, data: { ...enroll.toObject(), progress: parseProgress(enroll.progress) }, message: 'Enrollment retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve enrollment', error: err.message });
  }
};

exports.checkMyEnrollment = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const { programId } = req.params;
    const enrolls = await Enroll.find({ user_id: userId, program_id: programId });
    const parsed = enrolls.map(e => ({ ...e.toObject(), progress: parseProgress(e.progress) }));
    res.status(200).json({ success: true, data: parsed, message: 'User enrollments retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user enrollments', error: err.message });
  }
};

exports.createEnroll = async (req, res) => {
  try {
    const { program_id } = req.body;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId || !program_id) return res.status(400).json({ success: false, message: 'Missing required fields: user_id, program_id' });
    const exists = await Enroll.findOne({ user_id: userId, program_id });
    if (exists) return res.status(409).json({ success: false, message: 'User is already enrolled in this program' });
    const contents = await Content.find({ program_id });
    const progressArray = contents.map(c => ({ content_id: c._id, complete: false }));
    const enroll = new Enroll({ user_id: userId, program_id, start_at: new Date(), complete_at: null, progress: progressArray });
    console.log('enroll', enroll);
    await enroll.save();
    res.status(201).json({ success: true, data: { ...enroll.toObject(), progress: progressArray }, message: 'Enrollment created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create enrollment', error: err.message });
  }
};

exports.completeEnrollment = async (req, res) => {
  try {
    const { enrollId } = req.params; // format: userId_programId
    const [userId, programId] = enrollId.split('_');
    const enroll = await Enroll.findOne({ user_id: userId, program_id: programId });
    if (!enroll) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    const progressArray = parseProgress(enroll.progress).map(item => ({ ...item, complete: true }));
    enroll.complete_at = new Date();
    enroll.progress = JSON.stringify(progressArray);
    await enroll.save();
    res.status(200).json({ success: true, data: { ...enroll.toObject(), progress: progressArray }, message: 'Enrollment marked as completed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update enrollment completion', error: err.message });
  }
};

exports.toggleContentCompletion = async (req, res) => {
  try {
    const { enrollId, contentId } = req.params; // enrollId: userId_programId
    const [userId, programId] = enrollId.split('_');
    const enroll = await Enroll.findOne({ user_id: userId, program_id: programId });
    if (!enroll) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    let progressArray = parseProgress(enroll.progress);
    let found = false;
    progressArray = progressArray.map(item => {
      if (item.content_id.toString() === contentId.toString()) {
        found = true;
        return { ...item, complete: !item.complete };
      }
      return item;
    });
    if (!found) return res.status(404).json({ success: false, message: `Content with ID ${contentId} not found in enrollment progress` });
    // Nếu tất cả complete thì set complete_at, nếu không thì bỏ complete_at
    const allCompleted = progressArray.every(item => item.complete);
    enroll.progress = JSON.stringify(progressArray);
    enroll.complete_at = allCompleted ? new Date() : null;
    await enroll.save();
    res.status(200).json({ success: true, data: { ...enroll.toObject(), progress: progressArray }, message: `Content ${contentId} toggled` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle content completion', error: err.message });
  }
};

exports.deleteMyEnrollment = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const enroll = await Enroll.findOne({ user_id: userId, program_id: programId });
    if (!enroll) return res.status(404).json({ success: false, message: 'Enrollment not found. You are not enrolled in this program.' });
    await enroll.deleteOne();
    res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete enrollment', error: err.message });
  }
}; 