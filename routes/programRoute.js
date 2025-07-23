const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const authenticate = require("../middlewares/authentication");

router.get("/", authenticate, programController.getAllPrograms);
router.post("/", authenticate, programController.createProgram);
router.get("/category/:categoryId", programController.getProgramsByCategory);
router.get("/creator/:creatorId", authenticate, programController.getProgramsByCreator);
router.get("/category-details", authenticate, programController.getAllProgramsWithCategoryDetails);
router.get("/community-events", programController.getCommunityEventPrograms);
router.get("/my-enrollment-status", authenticate, programController.getUserProgramsWithEnrollmentStatus);
router.get("/recommendations", authenticate, programController.getProgramRecommendationsByAge);
router.get("/:programId/survey-analytics", authenticate, programController.getProgramSurveyAnalytics);
router.get("/:id", programController.getProgramById);
router.put("/:id", authenticate, programController.updateProgram);
router.delete("/:id", authenticate, programController.deleteProgram);
// Thêm các route khác nếu cần

module.exports = router; 