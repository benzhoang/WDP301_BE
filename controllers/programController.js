const Program = require("../models/programModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Quiz = require("../models/quizModel");
const Question = require("../models/questionModel");
const Content = require("../models/contentModel");
const { Types } = require("mongoose");

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

    // Validate category và creator
    if (category && !(await Category.findById(category))) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    if (creator && !(await User.findById(creator))) {
      return res
        .status(404)
        .json({ success: false, error: "Creator not found" });
    }

    // Tạo chương trình trước (chưa có quiz_id)
    const program = new Program({
      name,
      description,
      category,
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
      createdQuiz = await Quiz.create({
        name: quiz.name,
        description: quiz.description,
        program_id: program._id,
      });

      // Thêm câu hỏi vào quiz
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

      // Gán quiz_id lại cho Program
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

    res.status(201).json({
      success: true,
      program,
      quiz: createdQuiz || null,
    });
  } catch (err) {
    console.error("Create Program Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("category creator");
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
      "category creator"
    );
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật chương trình
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const program = await Program.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: program });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
    const programs = await Program.find().populate("category creator");
    // Gom nhóm theo category nếu cần
    const grouped = {};
    programs.forEach((p) => {
      const catId = p.category?._id?.toString() || "uncategorized";
      if (!grouped[catId])
        grouped[catId] = { category: p.category, programs: [] };
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
    }).populate("category creator");
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
    // Để khung, trả về message mẫu
    res.json({
      success: true,
      message: "Survey analytics endpoint (chưa triển khai logic)",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
