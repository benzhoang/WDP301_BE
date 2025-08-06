const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    score: { type: Number, required: true },
});

const assessmentQuestionSchema = new mongoose.Schema({
    type: { type: String, enum: ["CRAFFT", "ASSIST"], required: true },
    order: { type: Number, required: true },
    text: { type: String, required: true },
    questionType: { type: String, enum: ["single", "multiple"], default: "single" }, // 👈 Dạng câu hỏi
    options: [optionSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model("AssessmentQuestion", assessmentQuestionSchema);
