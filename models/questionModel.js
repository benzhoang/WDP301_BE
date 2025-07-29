const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["single", "multiple", "true_false", "short_answer"],
      required: true,
      default: "single",
    },
    name: { type: String, required: true },
    description: { type: String },
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    // Dùng cho multiple/single/true_false
    options: [
      {
        text: { type: String },
        is_correct: { type: Boolean, default: false },
      },
    ],

    // Dùng cho short_answer
    correct_answer: { type: String }, // có thể là text ngắn hoặc null
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
