const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.get("/", surveyController.getAllSurveys);
router.post("/", surveyController.createSurvey);
router.get("/:id", surveyController.getSurveyById);
router.get("/program/:programId", surveyController.getSurveysByProgramId);
router.get("/program/:programId/type/:type", surveyController.getSurveysByProgramAndType);
router.put("/:id", surveyController.updateSurvey);
// Thêm các route khác nếu cần

module.exports = router;