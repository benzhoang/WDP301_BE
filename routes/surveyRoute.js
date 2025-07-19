const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.get("/", surveyController.getAllSurveys);
router.post("/", surveyController.createSurvey);
router.get("/:id", surveyController.getSurveyById);
router.get("/program/:programId", surveyController.getSurveysByProgramId);
router.get("/type/:type/program/:programId", surveyController.getSurveysByTypeAndProgramId);
router.put("/:id", surveyController.updateSurvey);
// Thêm các route khác nếu cần

module.exports = router; 