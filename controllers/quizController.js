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
exports.getQuizByProgramWithoutAnswers = async (req, res) => {
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

exports.getQuizByProgramWithAnswers = async (req, res) => {
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
        is_correct: opt.is_correct,
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

// GET /api/programs/:programId/student-result
exports.getStudentResult = async (req, res) => {
  try {
    const { programId } = req.params;
    const user_id = req.user.userId;

    // Kiểm tra xem user có đăng ký program này không
    const enroll = await Enroll.findOne({ user_id, program_id: programId });
    if (!enroll) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này"
      });
    }

    // Lấy thông tin program
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học"
      });
    }

    // Lấy danh sách content của program
    const contents = await Content.find({ program_id: programId });

    // Tính toán tiến độ học tập
    const completedContents = Array.isArray(enroll.progress)
      ? enroll.progress.filter(p => p.complete).map(p => p.content_id.toString())
      : [];

    const totalContents = contents.length;
    const completedCount = completedContents.length;
    const progressPercentage = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;

    // Lấy kết quả quiz nếu có
    let quizResult = null;
    if (program.quiz_id) {
      const quizSubmission = await QuizSubmission.findOne({
        user_id,
        quiz_id: program.quiz_id,
        course_id: programId
      });

      if (quizSubmission) {
        const quiz = await Quiz.findById(program.quiz_id);
        const questions = await Question.find({ quiz_id: program.quiz_id });

        quizResult = {
          submission_id: quizSubmission._id,
          submitted_at: quizSubmission.submitted_at,
          score: quizSubmission.score,
          total_questions: questions.length,
          percentage: questions.length > 0 ? Math.round((quizSubmission.score / questions.length) * 100) : 0,
          status: quizSubmission.status,
          feedback: quizSubmission.feedback
        };
      }
    }

    // Kiểm tra trạng thái hoàn thành
    const isCompleted = enroll.completed_at ? true : false;
    const completedAt = enroll.completed_at;

    // Tạo response
    const result = {
      success: true,
      program: {
        _id: program._id,
        name: program.name,
        description: program.description
      },
      enrollment: {
        enrolled_at: enroll.enrolled_at,
        status: enroll.status,
        completed_at: completedAt,
        is_completed: isCompleted
      },
      progress: {
        total_contents: totalContents,
        completed_contents: completedCount,
        progress_percentage: progressPercentage,
        completed_content_ids: completedContents
      },
      quiz_result: quizResult,
      summary: {
        can_take_quiz: totalContents > 0 && completedCount === totalContents,
        has_quiz: !!program.quiz_id,
        has_submitted_quiz: !!quizResult
      }
    };

    res.json(result);

  } catch (err) {
    console.error("Error getting student result:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy kết quả học tập",
      error: err.message
    });
  }
};

// GET /api/programs/:programId/student-result/detailed
exports.getDetailedStudentResult = async (req, res) => {
  try {
    const { programId } = req.params;
    const user_id = req.user.userId;

    // Kiểm tra enrollment
    const enroll = await Enroll.findOne({ user_id, program_id: programId });
    if (!enroll) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa đăng ký khóa học này"
      });
    }

    // Lấy thông tin program và content
    const program = await Program.findById(programId);
    const contents = await Content.find({ program_id: programId }).sort({ order: 1 });

    // Lấy chi tiết tiến độ từng content
    const contentProgress = contents.map(content => {
      const progress = Array.isArray(enroll.progress)
        ? enroll.progress.find(p => p.content_id.toString() === content._id.toString())
        : null;

      return {
        content_id: content._id,
        title: content.title,
        type: content.type,
        order: content.order,
        is_completed: progress ? progress.complete : false,
        completed_at: progress ? progress.completed_at : null,
        time_spent: progress ? progress.time_spent : 0
      };
    });

    // Lấy chi tiết kết quả quiz nếu có
    let detailedQuizResult = null;
    if (program.quiz_id) {
      const quizSubmission = await QuizSubmission.findOne({
        user_id,
        quiz_id: program.quiz_id,
        course_id: programId
      });

      if (quizSubmission) {
        const questions = await Question.find({ quiz_id: program.quiz_id });

        // Lấy chi tiết từng câu trả lời
        const detailedAnswers = quizSubmission.answers.map(answer => {
          const question = questions.find(q => q._id.toString() === answer.question_id.toString());
          return {
            question_id: answer.question_id,
            question_text: question ? question.name : "Câu hỏi không tồn tại",
            question_type: question ? question.type : "unknown",
            selected_options: answer.selected_options,
            written_answer: answer.written_answer,
            is_correct: answer.is_correct,
            correct_options: question ? question.options.filter(opt => opt.is_correct).map(opt => ({
              _id: opt._id,
              text: opt.text
            })) : []
          };
        });

        detailedQuizResult = {
          submission_id: quizSubmission._id,
          submitted_at: quizSubmission.submitted_at,
          score: quizSubmission.score,
          total_questions: questions.length,
          percentage: questions.length > 0 ? Math.round((quizSubmission.score / questions.length) * 100) : 0,
          status: quizSubmission.status,
          feedback: quizSubmission.feedback,
          detailed_answers: detailedAnswers
        };
      }
    }

    const result = {
      success: true,
      program: {
        _id: program._id,
        name: program.name,
        description: program.description,
        quiz_id: program.quiz_id
      },
      enrollment: {
        enrolled_at: enroll.enrolled_at,
        status: enroll.status,
        completed_at: enroll.completed_at,
        is_completed: !!enroll.completed_at
      },
      content_progress: contentProgress,
      quiz_result: detailedQuizResult
    };

    res.json(result);

  } catch (err) {
    console.error("Error getting detailed student result:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết kết quả học tập",
      error: err.message
    });
  }
};
// POST /api/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const { name, description, duration, questions, program_id } = req.body;
    const user_id = req.user.userId;

    // Validate program
    const program = await Program.findById(program_id);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    // Create quiz
    const quiz = await Quiz.create({
      name,
      description,
      duration,
      creator: user_id,
      program_id
    });

    // Create questions
    const questionDocs = await Promise.all(
      questions.map(q =>
        Question.create({
          name: q.name,
          type: q.type,
          quiz_id: quiz._id,
          options: q.options.map(opt => ({
            text: opt.text,
            is_correct: opt.is_correct,
            score: opt.score
          }))
        })
      )
    );

    // Update program with quiz_id
    program.quiz_id = quiz._id;
    console.log(program)
    await program.save();

    res.status(201).json({
      success: true,
      quiz,
      questions: questionDocs
    });
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, questions } = req.body;

    // Find quiz
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Update quiz
    quiz.name = name || quiz.name;
    quiz.description = description || quiz.description;
    quiz.duration = duration || quiz.duration;
    await quiz.save();

    // Delete existing questions
    await Question.deleteMany({ quiz_id: id });

    // Create new questions
    const questionDocs = await Promise.all(
      questions.map(q =>
        Question.create({
          name: q.name,
          type: q.type,
          quiz_id: id,
          options: q.options.map(opt => ({
            text: opt.text,
            is_correct: opt.isCorrect,
            score: opt.score
          }))
        })
      )
    );

    res.json({
      success: true,
      quiz,
      questions: questionDocs
    });
  } catch (err) {
    console.error("Error updating quiz:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};