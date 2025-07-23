const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authenticate = require("../middlewares/authentication");

router.post("/", authenticate,profileController.createProfile);
// router.post('/:userId', profileController.createProfileForUserId);
router.get("/", profileController.getUserProfile);
router.get('/status', authenticate, profileController.getProfileStatus);
// Thêm các route khác nếu cần

module.exports = router; 