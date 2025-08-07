const Question = require("../models/questionModel");

exports.createQuestion = async (req, res) => {
    try {
        const { name, description, quiz_id } = req.body;
        const question = await Question.create({ name, description, quiz_id });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.updateQuestion = async (req, res) => {
    try {
        const { name, description, quiz_id } = req.body;
        const question = await Question.findByIdAndUpdate(req.params.id, { name, description, quiz_id }, { new: true });
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.getQuestionsByQuizId = async (req, res) => {
    try {
        const questions = await Question.find({ quiz_id: req.params.quiz_id });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}