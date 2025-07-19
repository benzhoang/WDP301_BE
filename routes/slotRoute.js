const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

router.get("/", slotController.getAllSlots);
router.post("/", slotController.createSlot);
// Thêm các route khác nếu cần

module.exports = router; 