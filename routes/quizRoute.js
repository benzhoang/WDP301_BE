const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authenticate = require("../middlewares/authentication");

router.get("/:quizId/check", authenticate, quizController.canTakeQuiz);
router.post("/:quizId/submit", authenticate, quizController.submitQuiz);
router.get("/by-program/:programId", authenticate, quizController.getQuizByProgramWithoutAnswers);
router.get("/by-program/:programId/answers", authenticate, quizController.getQuizByProgramWithAnswers);
router.post('/', authenticate, quizController.createQuiz);
router.put('/:id', authenticate, quizController.updateQuiz);

// Routes cho kiểm tra kết quả học tập
router.get("/programs/:programId/result", authenticate, quizController.getStudentResult);
router.get("/programs/:programId/result/detailed", authenticate, quizController.getDetailedStudentResult);

module.exports = router;
