// controllers/assessmentController.js

const AssessmentQuestion = require('../models/assessmentQuestionModel');

exports.getQuestionsByType = async (req, res) => {
    const { type } = req.params;

    try {
        const questions = await AssessmentQuestion.find({ type: type.toUpperCase() }).sort({ order: 1 });
        if (!questions.length) {
            return res.status(404).json({ message: "No questions found for this type" });
        }

        res.status(200).json(questions);
    } catch (err) {
        console.error("Error getting questions:", err);
        res.status(500).json({ message: "Server error" });
    }
};
