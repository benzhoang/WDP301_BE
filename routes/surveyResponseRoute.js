const express = require("express");
const router = express.Router();
const surveyResponseController = require("../controllers/surveyResponseController");

router.get("/", surveyResponseController.getAllSurveyResponses);
router.post("/", surveyResponseController.createSurveyResponse);
router.get("/:id", surveyResponseController.getSurveyResponseById);
router.get("/:id/parsed", surveyResponseController.getParsedSurveyResponseById);
router.get("/survey/:surveyId", surveyResponseController.getResponsesBySurveyId);
router.get("/user/:userId", surveyResponseController.getResponsesByUserId);
router.get("/:id/with-relations", surveyResponseController.getResponseWithRelations);
// Thêm các route khác nếu cần

module.exports = router; 