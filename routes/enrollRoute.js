const express = require("express");
const router = express.Router();
const enrollController = require("../controllers/enrollController");
const authentication = require("../middlewares/authentication");

router.get("/", enrollController.getAllEnrolls);
router.post("/", authentication, enrollController.createEnroll);
router.get("/user/:userId", enrollController.getEnrollmentsByUser);
router.get("/check/:programId", authentication, enrollController.checkMyEnrollment);
router.get("/program/:programId", enrollController.getEnrollmentsByProgram);
router.put("/:id/complete", enrollController.completeEnrollment);
router.patch("/:enrollId/content/:contentId/toggle", enrollController.toggleContentCompletion);
router.delete("/my/:programId", enrollController.deleteMyEnrollment);
// Thêm các route khác nếu cần

module.exports = router; 