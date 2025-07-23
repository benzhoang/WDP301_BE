const Survey = require("../models/surveyModel");
const Program = require("../models/programModel");
const SurveyResponse = require("../models/surveyResponseModel");

exports.createSurvey = async (req, res) => {
  try {
    const { program, type, questions } = req.body;
    if (!program || !type || !questions) {
      return res.status(400).json({ success: false, message: "Missing required fields: program, type, questions" });
    }
    const programExists = await Program.findById(program);
    if (!programExists) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }
    // Không cho tạo survey trùng type+program
    const existingSurvey = await Survey.findOne({ program, type });
    if (existingSurvey) {
      return res.status(409).json({ success: false, message: `Survey of type '${type}' already exists for this program`, existing_survey_id: existingSurvey._id });
    }
    // Validate questions: phải là mảng, mỗi câu hỏi có id, question
    let questionsArr = questions;
    if (typeof questions === 'string') {
      try { questionsArr = JSON.parse(questions); } catch (e) { return res.status(400).json({ success: false, message: "Invalid JSON format for questions", error: e.message }); }
    }
    if (!Array.isArray(questionsArr)) {
      return res.status(400).json({ success: false, message: "Questions must be an array" });
    }
    for (let i = 0; i < questionsArr.length; i++) {
      if (!questionsArr[i].id || !questionsArr[i].question) {
        return res.status(400).json({ success: false, message: `Question at index ${i} must have 'id' and 'question' properties` });
      }
    }
    // Lưu questions dạng object (không chỉ string)
    const survey = new Survey({ program, type, questions: questionsArr });
    await survey.save();
    res.status(201).json({ success: true, data: survey, message: "Survey created successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate("program");
    // Filter out deleted questions
    const filtered = surveys.map(s => ({ ...s.toObject(), questions: (s.questions||[]).filter(q => !q.deleted) }));
    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findById(id);
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    // Filter out deleted questions
    const filtered = { ...survey.toObject(), questions: (survey.questions||[]).filter(q => !q.deleted) };
    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSurveysByTypeAndProgramId = async (req, res) => {
  try {
    const { type, programId } = req.params;
    const surveys = await Survey.find({ type, program: programId });
    // Filter out deleted questions
    const filtered = surveys.map(s => ({ ...s.toObject(), questions: (s.questions||[]).filter(q => !q.deleted) }));
    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSurveysByProgramId = async (req, res) => {
  try {
    const { programId } = req.params;
    const surveys = await Survey.find({ program: programId });
    // Filter out deleted questions
    const filtered = surveys.map(s => ({ ...s.toObject(), questions: (s.questions||[]).filter(q => !q.deleted) }));
    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSurveysByProgramAndType = async (req, res) => {
  try {
    const { programId, type } = req.params;
    const surveys = await Survey.find({ program_id: programId, type });
    res.status(200).json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get surveys', error: err.message });
  }
};

// Cập nhật survey: soft delete question, version, validate
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { program, type, questions } = req.body;
    const survey = await Survey.findById(id);
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    // Validate questions nếu có
    let questionsArr = questions;
    if (questions !== undefined) {
      if (typeof questions === 'string') {
        try { questionsArr = JSON.parse(questions); } catch (e) { return res.status(400).json({ success: false, message: "Invalid JSON format for questions", error: e.message }); }
      }
      if (!Array.isArray(questionsArr)) {
        return res.status(400).json({ success: false, message: "Questions must be an array" });
      }
      // Soft delete logic: mark removed questions as deleted, version tăng nếu sửa
      let currentQuestions = survey.questions || [];
      let processedQuestions = [];
      let nextId = Math.max(0, ...currentQuestions.map(q => q.id || 0)) + 1;
      // Copy cũ sang processed
      currentQuestions.forEach(q => processedQuestions.push({ ...q }));
      // Xử lý từng câu hỏi mới
      questionsArr.forEach(newQ => {
        const idx = currentQuestions.findIndex(q => q.id === newQ.id);
        if (idx !== -1) {
          // Nếu nội dung khác thì tạo version mới, mark cũ deleted
          const oldQ = currentQuestions[idx];
          const changed = oldQ.question !== newQ.question || JSON.stringify(oldQ.options||[]) !== JSON.stringify(newQ.options||[]) || oldQ.type !== newQ.type || oldQ.required !== newQ.required;
          if (changed) {
            processedQuestions[idx].deleted = true;
            processedQuestions.push({ ...newQ, id: nextId++, deleted: false, original_id: newQ.id, version: (oldQ.version||1)+1 });
          } else {
            processedQuestions[idx].deleted = false;
          }
        } else {
          // Câu hỏi mới hoàn toàn
          processedQuestions.push({ ...newQ, deleted: false, version: 1 });
        }
      });
      // Mark các câu hỏi bị xóa khỏi list mới là deleted
      currentQuestions.forEach((oldQ, idx) => {
        const stillExists = questionsArr.some(newQ => newQ.id === oldQ.id);
        if (!stillExists && !oldQ.deleted) processedQuestions[idx].deleted = true;
      });
      survey.questions = processedQuestions;
    }
    if (program !== undefined) survey.program = program;
    if (type !== undefined) survey.type = type;
    await survey.save();
    // Filter out deleted questions
    const filtered = { ...survey.toObject(), questions: (survey.questions||[]).filter(q => !q.deleted) };
    res.json({ success: true, data: filtered, message: "Survey updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};