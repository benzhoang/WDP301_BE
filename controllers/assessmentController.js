const Assessment = require("../models/assessmentModel");
const User = require("../models/userModel");
const Action = require("../models/actionModel");

exports.createAssessment = async (req, res) => {
  try {
    const { user, type, score, result, details, taken_at } = req.body;
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const assessment = new Assessment({ user, type, score, result, details, taken_at });
    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("user_id");
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id).populate("user");
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });
    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssessmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await Assessment.find({ user: userId }).populate("user");
    res.status(200).json({ success: true, data: assessments, count: assessments.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssessmentsByUserToken = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const assessments = await Assessment.find({ user_id: userId }).populate("user_id");
    res.status(200).json({
      success: true,
      data: assessments.map(a => ({
        ...a.toObject(),
        create_at: a.createdAt
      })),
      count: assessments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssessmentsWithRelations = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("user");
    res.status(200).json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const assessment = await Assessment.findByIdAndUpdate(id, update, { new: true });
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });
    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });
    await assessment.deleteOne();
    res.status(200).json({ success: true, message: `Assessment with ID ${id} deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAssessmentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const assessments = await Assessment.find({ type });
    res.status(200).json({ success: true, data: assessments, count: assessments.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAssessmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: "Start date and end date are required" });
    const assessments = await Assessment.find({
      taken_at: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    res.status(200).json({ success: true, data: assessments, count: assessments.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.takeTestFromUser = async (req, res) => {
  try {
    const { score, type, results } = req.body;
    const userId = req.user?.userId || req.body.userId;

    // Validate dữ liệu đầu vào
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: "Results array is required and cannot be empty" });
    }

    if (!userId || typeof score !== 'number') {
      return res.status(400).json({ success: false, message: "User ID and score are required" });
    }

    // Kiểm tra người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role?.toLowerCase() !== "member") {
      return res.status(403).json({ success: false, message: "Only members can take tests" });
    }

    // Tìm hành động phù hợp với điểm số
    const actions = await Action.find({ type }).sort({ range: -1 }); // Giảm dần để lấy cái gần nhất
    const action = actions.find(a => score >= a.range);
    if (!action) {
      return res.status(404).json({ success: false, message: `No matching action found for score ${score}` });
    }

    // Tạo dữ liệu kết quả
    const result_json = {
      score,
      risk_level: action.risk_level || "moderate",
      results,
      recommendations: action.description
    };

    // Lưu vào database
    const assessment = new Assessment({
      user_id: userId,
      action_id: action._id,
      type,
      score,
      result_json,
      taken_at: new Date()
    });

    await assessment.save();

    // Trả kết quả
    return res.status(201).json({
      success: true,
      data: {
        assessment_id: assessment._id,
        user: { user_id: userId },
        test_result: {
          score,
          type: assessment.type,
          taken_at: assessment.taken_at,
          result_json: assessment.result_json
        },
        recommended_action: {
          description: action.description,
          range: action.range,
          type: action.type,
          risk_level: action.risk_level || "moderate"
        }
      },
      message: "Assessment submitted successfully"
    });

  } catch (err) {
    console.error("❌ Error in takeTestFromUser:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};



exports.getAssessmentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role && user.role.toLowerCase() !== "member") {
      return res.status(400).json({ success: false, message: "Only member users can access assessment details" });
    }
    // Lấy assessment join action, user
    const assessments = await Assessment.find({ user: userId }).populate("user");
    // Nếu có Action model, có thể populate thêm action nếu cần
    res.status(200).json({
      success: true,
      data: assessments,
      count: assessments.length,
      message: `Assessment details for member user ${userId} retrieved successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 