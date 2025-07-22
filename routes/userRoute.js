const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.get("/profile-combined", userController.getUserProfileCombined);
router.put("/profile-combined", userController.updateUserProfileCombined);
router.delete("/delete-account", userController.deleteUserCascade);
router.get("/role", userController.getUserRoleById);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router; 