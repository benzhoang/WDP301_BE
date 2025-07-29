const Quiz = require("../models/quizModel");
const Program = require("../models/programModel");
const Enroll = require("../models/enrollModel");
const Question = require("../models/questionModel");
const Content = require("../models/contentModel");
const QuizSubmission = require("../models/quizSubmittionModel");

// GET /api/quizzes/:quizId/check
exports.canTakeQuiz = async (req, res) => {
  const user_id = req.user.userId;
  const quiz_id = req.params.quizId;

  const program = await Program.findOne({ quiz_id });
  if (!program)
    return res.status(404).json({ message: "Quiz không thuộc khóa học nào" });
  const enroll = await Enroll.findOne({ user_id, program_id: program._id });
  if (!enroll)
    return res.status(403).json({ message: "Chưa đăng ký khóa học" });

  const contents = await Content.find({ program_id: program._id });
  const contentIds = contents.map((c) => c._id.toString());

  const completed = Array.isArray(enroll.progress)
    ? enroll.progress
        .filter((p) => p.complete)
        .map((p) => p.content_id.toString())
    : [];

  const allDone = contentIds.every((id) => completed.includes(id));

  if (!allDone)
    return res.status(403).json({ message: "Chưa hoàn thành tất cả nội dung" });

  res.json({ canTakeQuiz: true });
};

// POST /api/quizzes/:quizId/submit
exports.submitQuiz = async (req, res) => {
  const user_id = req.user.userId;
  const quiz_id = req.params.quizId;
  const answers = req.body.answers;

  const quiz = await Quiz.findById(quiz_id);
  const program = await Program.findOne({ quiz_id });

  const enroll = await Enroll.findOne({ user_id, program_id: program._id });
  if (!enroll)
    return res.status(403).json({ message: "Chưa đăng ký khóa học" });

  // Kiểm tra đã hoàn thành hết content chưa
  const contents = await Content.find({ program_id: program._id });
  const completed = Array.isArray(enroll.progress)
    ? enroll.progress
        .filter((p) => p.complete)
        .map((p) => p.content_id.toString())
    : [];

  const allDone = contents.every((c) => completed.includes(c._id.toString()));

  if (!allDone)
    return res.status(403).json({ message: "Chưa hoàn thành hết bài học" });

  const questions = await Question.find({ quiz_id });
  let score = 0;

  const processedAnswers = answers.map((ans) => {
    const question = questions.find(
      (q) => q._id.toString() === ans.question_id
    );
    let correct = false;

    if (question.type === "multiple") {
      const selectedOptionIds = (ans.selected_options || []).map((id) =>
        id.toString()
      );
      const correctOptionIds = question.options
        .filter((o) => o.is_correct)
        .map((o) => o._id.toString());

      correct =
        correctOptionIds.length === selectedOptionIds.length &&
        correctOptionIds.every((id) => selectedOptionIds.includes(id));
    } else if (question.type === "true_false" || question.type === "single") {
      const correctOption = question.options.find((o) => o.is_correct);
      correct =
        correctOption &&
        correctOption._id.toString() === ans.selected_options?.[0];
    }

    if (correct) score += 1;

    return {
      question_id: ans.question_id,
      selected_options: ans.selected_options,
      written_answer: ans.written_answer,
      is_correct: correct,
    };
  });

  const submission = await QuizSubmission.create({
    user_id,
    quiz_id,
    course_id: program._id,
    answers: processedAnswers,
    score,
    status: "graded",
  });

  // cập nhật completed_at nếu cần
  // cập nhật completed_at nếu user đã hoàn thành quiz và content
  if (!enroll.completed_at) {
    const allContentIds = contents.map((c) => c._id.toString());
    const completedContentIds = enroll.progress
      .filter((p) => p.complete)
      .map((p) => p.content_id.toString());

    const allContentDone = allContentIds.every((id) =>
      completedContentIds.includes(id)
    );

    const allAnswersCorrect = processedAnswers.every((ans) => ans.is_correct);

    if (allContentDone && allAnswersCorrect) {
      enroll.completed_at = new Date();
      await enroll.save();
    }
  }

  res.status(201).json(submission);
};
// GET /api/programs/:programId/quiz
exports.getQuizByProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await Program.findById(programId);
    if (!program || !program.quiz_id) {
      return res.status(404).json({
        success: false,
        message: "Chưa có quiz cho khóa học này",
      });
    }

    const quiz = await Quiz.findById(program.quiz_id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quiz",
      });
    }

    const questions = await Question.find({ quiz_id: quiz._id });

    // Ẩn is_correct để người dùng không biết trước đáp án
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      name: q.name,
      type: q.type,
      quiz_id: q.quiz_id,
      options: q.options.map((opt) => ({
        _id: opt._id,
        text: opt.text,
      })),
    }));

    res.json({
      success: true,
      quiz,
      questions: safeQuestions,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
