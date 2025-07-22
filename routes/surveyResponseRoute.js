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
router.put('/:id', surveyResponseController.updateSurveyResponse);
router.delete('/:id', surveyResponseController.deleteSurveyResponse);
router.get('/survey/:surveyId/user/:userId/check', surveyResponseController.checkUserResponse);
router.get('/survey/:surveyId/analytics', surveyResponseController.analytics);
router.post('/keyvalue', surveyResponseController.submitSurveyResponseKeyValue);
router.put('/keyvalue', surveyResponseController.updateSurveyResponseKeyValue);
router.get('/survey/:surveyId/check-mine', surveyResponseController.checkMyResponse);
router.get('/my/keyvalue', surveyResponseController.getMySurveyResponsesKeyValue);
// Thêm các route khác nếu cần

module.exports = router; 