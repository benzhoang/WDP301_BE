const express = require("express");
const router = express.Router();
const AssessmentQuestionController = require("../controllers/assessmentQuestionController");
const authentication = require("../middlewares/authentication");

router.get("/type/:type", authentication, AssessmentQuestionController.getQuestionsByType);

module.exports = router; 