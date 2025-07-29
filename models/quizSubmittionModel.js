const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },

  // Lưu danh sách option đã chọn nếu là multiple-choice
  selected_options: [{ type: String }],

  // Lưu câu trả lời viết nếu là dạng tự luận
  written_answer: { type: String },

  // Hệ thống có thể tính điểm cho auto-graded câu hỏi
  is_correct: { type: Boolean },
}, { _id: false });

const quizSubmissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },

  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },

  submitted_at: { type: Date, default: Date.now },

  score: { type: Number, default: 0 },

  answers: [answerSchema],

  feedback: { type: String }, // Tuỳ chọn: giáo viên chấm thủ công

  status: {
    type: String,
    enum: ["pending", "graded", "completed"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("QuizSubmission", quizSubmissionSchema);
