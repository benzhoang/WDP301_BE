const express = require("express");
const router = express.Router();
const flagController = require("../controllers/flagController");

router.get("/", flagController.getAllFlags);
router.post("/", flagController.createFlag);
// Thêm các route khác nếu cần

module.exports = router; 