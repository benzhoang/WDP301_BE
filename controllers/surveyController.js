const Survey = require("../models/surveyModel");
const Program = require("../models/programModel");

exports.createSurvey = async (req, res) => {
  try {
    const { program, type, questions } = req.body;
    const programExists = await Program.findById(program);
    if (!programExists) {
      return res.status(404).json({ success: false, error: "Program not found" });
    }
    const survey = new Survey({ program, type, questions });
    await survey.save();
    res.status(201).json({ success: true, survey });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate("program");
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy survey theo ID
exports.getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findById(id);
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    res.json({ success: true, data: survey });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy survey theo type và program
exports.getSurveysByTypeAndProgramId = async (req, res) => {
  try {
    const { type, programId } = req.params;
    const surveys = await Survey.find({ type, program: programId });
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy survey theo program
exports.getSurveysByProgramId = async (req, res) => {
  try {
    const { programId } = req.params;
    const surveys = await Survey.find({ program: programId });
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật survey
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const survey = await Survey.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: survey });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 