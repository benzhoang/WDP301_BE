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
    const response = new SurveyResponse({ survey, user, answers, submitted_at });
    await response.save();
    res.status(201).json({ success: true, response });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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