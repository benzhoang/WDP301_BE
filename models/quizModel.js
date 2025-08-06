const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true } // duration in minutes

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);