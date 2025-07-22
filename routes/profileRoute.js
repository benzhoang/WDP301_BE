const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.post("/", profileController.createProfile);
// router.post('/:userId', profileController.createProfileForUserId);
router.get("/", profileController.getUserProfile);
router.get('/status', profileController.getProfileStatus);
// Thêm các route khác nếu cần

module.exports = router; 