const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

router.get("/", assessmentController.getAllAssessments);
router.post("/", assessmentController.createAssessment);
// Thêm các route khác nếu cần

module.exports = router; 