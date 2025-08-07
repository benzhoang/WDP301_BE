const Enroll = require("../models/enrollModel");
const Content = require("../models/contentModel");
const Quiz = require("../models/quizModel")
const QuizSubmission = require("../models/quizSubmittionModel")

exports.getAllEnrolls = async (req, res) => {
  try {
    const enrolls = await Enroll.find();
    res.status(200).json({
      success: true,
      data: enrolls,
      message: "Enrollments retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve enrollments",
      error: err.message,
    });
  }
};

exports.getEnrollmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const enrolls = await Enroll.find({ user_id: userId });
    res.status(200).json({
      success: true,
      data: enrolls,
      message: "User enrollments retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user enrollments",
      error: err.message,
    });
  }
};

exports.getEnrollmentsByProgram = async (req, res) => {
  try {
    console.log("=== getEnrollmentsByProgram called ===");
    console.log("Full request params:", req.params);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    const { programId } = req.params;
    console.log("Extracted programId:", programId);

    const enrolls = await Enroll.find({ program_id: programId });
    res.status(200).json({
      success: true,
      data: enrolls,
      message: "Program enrollments retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve program enrollments",
      error: err.message,
    });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const { enrollId } = req.params;
    const enroll = await Enroll.findById(enrollId);
    if (!enroll)
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.status(200).json({
      success: true,
      data: enroll,
      message: "Enrollment retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve enrollment",
      error: err.message,
    });
  }
};

exports.checkMyEnrollment = async (req, res) => {
  try {
    console.log("=== checkMyEnrollment called ===");
    console.log("Full request params:", req.params);
    console.log("Full request user:", req.user);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    const userId = req.user?.userId || req.user?._id || req.user?.id;
    console.log("Extracted userId:", userId);

    const programId = req.params.programId;
    console.log("Extracted programId:", programId);

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: "programId is required",
        params: req.params,
        url: req.url,
      });
    }

    // Tìm thông tin đăng ký
    const enrolls = await Enroll.find({
      user_id: userId,
      program_id: programId,
    });

    if (!enrolls || enrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đăng ký",
      });
    }

    // Kiểm tra trạng thái hoàn thành nội dung
    const contents = await Content.find({ program_id: programId });
    const contentStatus = contents.map((content) => {
      const progress = enrolls[0].progress.find(
        (p) => p.content_id.toString() === content._id.toString()
      );
      return {
        content_id: content._id,
        title: content.title, // Giả sử Content có trường title
        completed: !!progress?.complete,
        completed_at: progress?.completed_at || null,
      };
    });

    const allContentCompleted = contentStatus.every((c) => c.completed);

    // Kiểm tra trạng thái bài kiểm tra
    const quiz = await Quiz.findOne({ program_id: programId });
    let allQuestionsCorrect = false;

    if (quiz) {
      const submission = await QuizSubmission.findOne({
        user_id: userId,
        quiz_id: quiz._id,
        course_id: programId,
      });

      if (submission) {
        allQuestionsCorrect = submission.answers.every((ans) => ans.is_correct);
      }
    }

    // Cập nhật completed_at nếu cần
    const enroll = enrolls[0];
    if (enroll.completed_at && (!allContentCompleted || !allQuestionsCorrect)) {
      enroll.completed_at = null;
      await enroll.save();
    }

    res.status(200).json({
      success: true,
      data: enrolls,
      message: "User enrollments retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user enrollments",
      error: err.message,
    });
  }
};
exports.createEnroll = async (req, res) => {
  try {
    const { program_id } = req.body;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId || !program_id)
      return res.status(400).json({
        success: false,
        message: "Missing required fields: user_id, program_id",
      });
    const exists = await Enroll.findOne({ user_id: userId, program_id });
    if (exists)
      return res.status(409).json({
        success: false,
        message: "User is already enrolled in this program",
      });
    const contents = await Content.find({ program_id });
    const progressArray = contents.map((c) => ({
      content_id: c._id,
      complete: false,
    }));
    const enroll = new Enroll({
      user_id: userId,
      program_id,
      start_at: new Date(),
      complete_at: null,
      progress: progressArray,
    });
    await enroll.save();
    res.status(201).json({
      success: true,
      data: enroll,
      message: "Enrollment created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: err.message,
    });
  }
};

exports.completeEnrollment = async (req, res) => {
  try {
    const { enrollId } = req.params;
    const enroll = await Enroll.findById(enrollId);
    if (!enroll)
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    const progressArray = enroll.progress.map((item) => ({
      ...item,
      complete: true,
    }));
    enroll.progress = progressArray;
    await enroll.save();
    res.status(200).json({
      success: true,
      data: enroll,
      message: "Enrollment marked as completed",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update enrollment completion",
      error: err.message,
    });
  }
};

exports.toggleContentCompletion = async (req, res) => {
  try {
    const { enrollId, contentId } = req.params;
    const enroll = await Enroll.findById(enrollId);
    if (!enroll)
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    let progressArray = enroll.progress;
    let found = false;
    progressArray = progressArray.map((item) => {
      if (item.content_id.toString() === contentId.toString()) {
        found = true;
        return { ...item, complete: !item.complete };
      }
      return item;
    });
    if (!found)
      return res.status(404).json({
        success: false,
        message: `Content with ID ${contentId} not found in enrollment progress`,
      });
    enroll.progress = progressArray;
    await enroll.save();
    res.status(200).json({
      success: true,
      data: enroll,
      message: `Content ${contentId} toggled`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle content completion",
      error: err.message,
    });
  }
};

exports.deleteMyEnrollment = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const enroll = await Enroll.findOne({
      user_id: userId,
      program_id: programId,
    });
    if (!enroll)
      return res.status(404).json({
        success: false,
        message: "Enrollment not found. You are not enrolled in this program.",
      });
    await enroll.deleteOne();
    res.status(200).json({ success: true, message: "Enrollment deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete enrollment",
      error: err.message,
    });
  }
};
