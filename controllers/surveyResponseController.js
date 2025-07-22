const SurveyResponse = require("../models/surveyResponseModel");
const Survey = require("../models/surveyModel");
const User = require("../models/userModel");

exports.createSurveyResponse = async (req, res) => {
  try {
    const { survey, user, answers, submitted_at } = req.body;
    const surveyExists = await Survey.findById(survey);
    const userExists = await User.findById(user);
    if (!surveyExists || !userExists) {
      return res.status(404).json({ success: false, error: "Survey or user not found" });
    }
    // Không cho nộp nhiều lần
    const existed = await SurveyResponse.findOne({ survey, user });
    if (existed) {
      return res.status(409).json({ success: false, message: "User has already submitted a response for this survey", existingResponseId: existed._id });
    }
    // Validate answers: phải là mảng, mapping đúng question id
    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers must be an array" });
    }
    // Có thể validate sâu hơn nếu cần
    const response = new SurveyResponse({ survey, user, answers, submitted_at });
    await response.save();
    res.status(201).json({ success: true, response });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateSurveyResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ success: false, message: "Answers are required" });
    const response = await SurveyResponse.findById(id);
    if (!response) return res.status(404).json({ success: false, message: "Survey response not found" });
    response.answers = answers;
    response.submitted_at = new Date();
    await response.save();
    res.status(200).json({ success: true, data: response, message: "Survey response updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteSurveyResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await SurveyResponse.findById(id);
    if (!response) return res.status(404).json({ success: false, message: "Survey response not found" });
    await response.deleteOne();
    res.status(200).json({ success: true, message: `Survey response with ID ${id} deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.checkUserResponse = async (req, res) => {
  try {
    const { surveyId, userId } = req.params;
    if (!surveyId || !userId) return res.status(400).json({ success: false, message: "Survey ID and User ID are required" });
    const response = await SurveyResponse.findOne({ survey: surveyId, user: userId });
    res.status(200).json({
      success: true,
      hasResponded: !!response,
      responseId: response ? response._id : null,
      message: response ? 'User has already responded to this survey' : 'User has not responded to this survey'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    const responses = await SurveyResponse.find({ survey: surveyId });
    // Thống kê số lượng trả lời cho từng câu hỏi
    const analytics = {};
    (survey.questions || []).forEach(q => {
      analytics[q.id] = { question: q.question, total: 0, answerCounts: {} };
    });
    responses.forEach(r => {
      (r.answers || []).forEach(ans => {
        if (analytics[ans.question]) {
          analytics[ans.question].total++;
          const val = ans.answer;
          if (Array.isArray(val)) {
            val.forEach(v => {
              analytics[ans.question].answerCounts[v] = (analytics[ans.question].answerCounts[v] || 0) + 1;
            });
          } else {
            analytics[ans.question].answerCounts[val] = (analytics[ans.question].answerCounts[val] || 0) + 1;
          }
        }
      });
    });
    res.status(200).json({ success: true, data: analytics, message: "Survey analytics generated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitSurveyResponseKeyValue = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.user;
    const { survey, responses } = req.body;
    if (!survey || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: "Survey and responses array are required" });
    }
    // Không cho nộp nhiều lần
    const existed = await SurveyResponse.findOne({ survey, user: userId });
    if (existed) {
      return res.status(409).json({ success: false, message: "User has already responded to this survey. Use update endpoint to modify existing response." });
    }
    // Validate responses
    for (const r of responses) {
      if (!r.id || !r.question || r.answer === undefined) {
        return res.status(400).json({ success: false, message: "Each response must have id, question, and answer fields" });
      }
    }
    const response = new SurveyResponse({ survey, user: userId, answers: responses, submitted_at: new Date() });
    await response.save();
    res.status(201).json({ success: true, data: response, message: "Survey response submitted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateSurveyResponseKeyValue = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.user;
    const { survey, responses } = req.body;
    if (!survey || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: "Survey and responses array are required" });
    }
    const existed = await SurveyResponse.findOne({ survey, user: userId });
    if (!existed) {
      return res.status(404).json({ success: false, message: "No existing response found for this user and survey. Use submit endpoint to create new response." });
    }
    existed.answers = responses;
    existed.submitted_at = new Date();
    await existed.save();
    res.status(200).json({ success: true, data: existed, message: "Survey response updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.checkMyResponse = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { surveyId } = req.params;
    if (!surveyId) return res.status(400).json({ success: false, message: "Survey ID is required" });
    const response = await SurveyResponse.findOne({ survey: surveyId, user: userId });
    res.status(200).json({
      success: true,
      hasResponded: !!response,
      responseId: response ? response._id : null,
      surveyId,
      userId,
      submittedAt: response ? response.submitted_at : null,
      message: response ? 'You have already responded to this survey' : 'You have not responded to this survey yet'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMySurveyResponsesKeyValue = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const responses = await SurveyResponse.find({ user: userId }).populate('survey');
    const formatted = responses.map(r => ({
      response_id: r._id,
      survey_id: r.survey?._id,
      survey_type: r.survey?.type,
      survey_program_id: r.survey?.program,
      responses: r.answers,
      submitted_at: r.submitted_at,
      total_questions: r.answers?.length || 0
    }));
    res.status(200).json({ success: true, data: formatted, count: formatted.length, message: 'User survey responses retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllSurveyResponses = async (req, res) => {
  try {
    const responses = await SurveyResponse.find().populate("survey user");
    res.json({ success: true, data: responses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy survey response theo ID
exports.getSurveyResponseById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await SurveyResponse.findById(id);
    if (!response) return res.status(404).json({ success: false, message: "Survey response not found" });
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy response đã parse answer JSON
exports.getParsedSurveyResponseById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await SurveyResponse.findById(id);
    if (!response) return res.status(404).json({ success: false, message: "Survey response not found" });
    res.json({
      success: true,
      data: {
        ...response.toObject(),
        answers: response.answers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy response theo survey
exports.getResponsesBySurveyId = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const responses = await SurveyResponse.find({ survey: surveyId });
    res.json({ success: true, data: responses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy response theo user
exports.getResponsesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const responses = await SurveyResponse.find({ user: userId });
    res.json({ success: true, data: responses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy response kèm thông tin user và survey
exports.getResponseWithRelations = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await SurveyResponse.findById(id).populate("survey user");
    if (!response) return res.status(404).json({ success: false, message: "Survey response not found" });
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 