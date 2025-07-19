const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.get("/profile-combined", userController.getUserProfileCombined);
router.put("/profile-combined", userController.updateUserProfileCombined);
router.delete("/delete-account", userController.deleteUserCascade);
// Thêm các route khác nếu cần

module.exports = router; 