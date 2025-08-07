const Program = require("../models/programModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Quiz = require("../models/quizModel");
const Question = require("../models/questionModel");
const Content = require("../models/contentModel");
const { Types } = require("mongoose");
const Survey = require("../models/surveyModel");
const SurveyResponse = require("../models/surveyResponseModel");

exports.createProgram = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      start_date,
      end_date,
      status,
      image,
      creator,
      quiz,
      contents,
    } = req.body;

    // Kiểm tra category
    if (category && !(await Category.findById(category))) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Kiểm tra creator
    if (creator && !(await User.findById(creator))) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    // Tạo chương trình (chưa gán quiz)
    const program = new Program({
      name,
      description,
      category_id: category,
      start_date,
      end_date,
      status,
      image,
      creator,
    });

    await program.save();

    // Tạo quiz nếu có
    let createdQuiz = null;
    if (quiz) {
      // Validate trường duration
      if (!quiz.duration || typeof quiz.duration !== "number") {
        return res.status(400).json({
          success: false,
          error: "Quiz duration is required and must be a number",
        });
      }

      createdQuiz = await Quiz.create({
        name: quiz.name,
        description: quiz.description,
        duration: quiz.duration,
      });

      // Tạo danh sách câu hỏi nếu có
      if (quiz.questions?.length > 0) {
        for (const q of quiz.questions) {
          await Question.create({
            name: q.name,
            quiz_id: createdQuiz._id,
            type: q.type || "single",
            options: q.options,
          });
        }
      }

      // Gán quiz_id vào program
      program.quiz_id = createdQuiz._id;
      await program.save();
    }

    // Tạo content nếu có
    if (contents?.length > 0) {
      for (const c of contents) {
        await Content.create({
          ...c,
          program_id: program._id,
        });
      }
    }

    // Trả kết quả thành công
    res.status(201).json({
      success: true,
      program,
      quiz: createdQuiz || null,
    });
  } catch (err) {
    console.error("Create Program Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("category_id creator");
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy chương trình theo category
exports.getProgramsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const programs = await Program.find({ category_id: categoryId }).populate(
      "category_id"
    );
    const formattedPrograms = programs.map((program) => ({
      program_id: program._id,
      name: program.name,
      description: program.description,
      category_id: program.category_id,
      start_date: program.start_date,
      end_date: program.end_date,
      status: program.status,
      image: program.image,
      creator: program.creator,
    }));
    res.json({ success: true, data: formattedPrograms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy chương trình theo creator
exports.getProgramsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const programs = await Program.find({ creator: creatorId }).populate(
      "category_id creator"
    );
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      start_date,
      end_date,
      status,
      image,
      creator,
      quiz,
      contents,
    } = req.body;

    // Kiểm tra chương trình tồn tại
    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        error: "Program not found",
      });
    }

    // Kiểm tra category nếu được cung cấp
    if (category && !(await Category.findById(category))) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Kiểm tra creator nếu được cung cấp
    if (creator && !(await User.findById(creator))) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    // Cập nhật các trường cơ bản của chương trình
    const updateData = {
      name: name || program.name,
      description: description || program.description,
      category_id: category || program.category_id,
      start_date: start_date || program.start_date,
      end_date: end_date || program.end_date,
      status: status || program.status,
      image: image || program.image,
      creator: creator || program.creator,
    };

    // Cập nhật hoặc tạo mới quiz nếu được cung cấp
    let createdQuiz = null;
    if (quiz) {
      // Validate trường duration
      if (quiz.duration && typeof quiz.duration !== "number") {
        return res.status(400).json({
          success: false,
          error: "Quiz duration must be a number",
        });
      }

      // Nếu chương trình đã có quiz, cập nhật
      if (program.quiz_id) {
        createdQuiz = await Quiz.findByIdAndUpdate(
          program.quiz_id,
          {
            name: quiz.name || undefined,
            description: quiz.description || undefined,
            duration: quiz.duration || undefined,
          },
          { new: true }
        );

        // Cập nhật danh sách câu hỏi nếu có
        if (quiz.questions?.length > 0) {
          // Xóa các câu hỏi cũ
          await Question.deleteMany({ quiz_id: program.quiz_id });

          // Tạo danh sách câu hỏi mới
          for (const q of quiz.questions) {
            await Question.create({
              name: q.name,
              quiz_id: program.quiz_id,
              type: q.type || "single",
              options: q.options,
            });
          }
        }
      } else {
        // Tạo quiz mới nếu chưa có
        createdQuiz = await Quiz.create({
          name: quiz.name,
          description: quiz.description,
          duration: quiz.duration,
        });

        // Gán quiz_id vào chương trình
        updateData.quiz_id = createdQuiz._id;
      }
    }

    // Cập nhật contents nếu được cung cấp
    if (contents?.length > 0) {
      // Xóa contents cũ
      await Content.deleteMany({ program_id: program._id });

      // Tạo contents mới
      for (const c of contents) {
        await Content.create({
          ...c,
          program_id: program._id,
        });
      }
    }

    // Cập nhật chương trình
    const updatedProgram = await Program.findByIdAndUpdate(id, updateData, { new: true });

    // Trả kết quả thành công
    res.status(200).json({
      success: true,
      program: updatedProgram,
      quiz: createdQuiz || (program.quiz_id ? await Quiz.findById(program.quiz_id) : null),
      questions: (program.quiz_id ? await Question.find({ quiz_id: program.quiz_id }) : null),
    });
  } catch (err) {
    console.error("Update Program Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// Xóa chương trình (hard delete)
exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findByIdAndDelete(id);
    res.json({ success: true, message: "Program deleted", data: program });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id).populate("category_id creator");
    if (!program)
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    res.json({ success: true, data: program });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllProgramsWithCategoryDetails = async (req, res) => {
  try {
    // Lấy tất cả program, populate category
    const programs = await Program.find().populate("category_id creator");
    // Gom nhóm theo category nếu cần
    const grouped = {};
    programs.forEach((p) => {
      const catId = p.category_id?._id?.toString() || "uncategorized";
      if (!grouped[catId])
        grouped[catId] = { category: p.category_id, programs: [] };
      grouped[catId].programs.push(p);
    });
    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCommunityEventPrograms = async (req, res) => {
  try {
    // Giả sử có trường isCommunityEvent hoặc type === 'community-event'
    const programs = await Program.find({
      $or: [{ isCommunityEvent: true }, { type: "community-event" }],
    }).populate("category_id creator");
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserProgramsWithEnrollmentStatus = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    // Sửa lại populate cho đúng trường
    const programs = await Program.find().populate("category_id creator");
    const Enroll = require("../models/enrollModel");
    const enrolls = await Enroll.find({ user_id: userId });
    const enrolledProgramIds = new Set(
      enrolls.map((e) => e.program_id.toString())
    );
    const result = programs.map((p) => ({
      ...p.toObject(),
      is_enrolled: enrolledProgramIds.has(p._id.toString()),
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProgramRecommendationsByAge = async (req, res) => {
  try {
    // Giả sử req.user.userId đã có, lấy profile để biết tuổi
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const Profile = require("../models/profileModel");
    const objectUserId = new Types.ObjectId(userId);
    const profile = await Profile.findOne({ user_id: objectUserId });
    if (!profile || !profile.date_of_birth)
      return res
        .status(400)
        .json({ success: false, message: "No profile or date_of_birth" });
    const birthYear = new Date(profile.date_of_birth).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    // Giả sử Program có trường age_group (ví dụ: '18+', '13-17', ...)
    const programs = await Program.find().populate("category_id creator");
    // Lọc program phù hợp với tuổi (ví dụ: age_group === '18+' && age >= 18)
    const recommended = programs.filter((p) => {
      if (!p.age_group) return true;
      if (p.age_group === "18+") return age >= 18;
      if (p.age_group === "13-17") return age >= 13 && age <= 17;
      return true;
    });
    res.json({ success: true, data: recommended });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProgramSurveyAnalytics = async (req, res) => {
  try {
    const { programId } = req.params;

    // Validate program ID
    if (!programId) {
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Fetch surveys for the program
    const surveys = await Survey.find({ program_id: programId });

    // Fetch response counts for each survey
    const surveyAnalytics = await Promise.all(
      surveys.map(async (survey) => {
        const totalResponses = await SurveyResponse.countDocuments({ survey_id: survey._id });
        return {
          id: survey._id.toString(),
          type: survey.type || 'unknown',
          total_responses: totalResponses,
          responses: {}, // Populate with question response data if needed
          error: null, // Set to error message if applicable
        };
      })
    );

    // Calculate completion statistics
    const completedParticipants = await SurveyResponse.countDocuments({
      program_id: programId,
      completed: true,
    });
    const incompleteParticipants = await SurveyResponse.countDocuments({
      program_id: programId,
      completed: false,
    });

    // Construct response data
    const analytics = {
      surveys: surveyAnalytics,
      total_surveys: surveys.length,
      total_responses: surveyAnalytics.reduce((sum, survey) => sum + survey.total_responses, 0),
      completion_statistics: {
        completed_participants: completedParticipants,
        incomplete_participants: incompleteParticipants,
      },
    };

    res.json({ success: true, data: analytics });
  } catch (err) {
    console.error('Error fetching survey analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
