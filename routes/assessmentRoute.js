const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const authentica = require("../middlewares/authentication");

router.get("/", assessmentController.getAllAssessments);
router.post("/", assessmentController.createAssessment);
// router.get('/:id', assessmentController.getAssessmentById);
router.get('/user/:userId', assessmentController.getAssessmentsByUserId);
router.get('/type/:type', assessmentController.getAssessmentsByType);
router.get('/date-range', assessmentController.getAssessmentsByDateRange);
router.get('/with-relations', assessmentController.getAssessmentsWithRelations);
router.get('/me', authentica, assessmentController.getAssessmentsByUserToken);
router.put('/:id', assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);
router.post('/take-test', authentica, assessmentController.takeTestFromUser);
router.get('/details/:userId', assessmentController.getAssessmentDetails);
// Thêm các route khác nếu cần

module.exports = router; 