const express = require("express");
const router = express.Router();
const consultantSlotController = require("../controllers/consultantSlotController");

router.get("/", consultantSlotController.getAllConsultantSlots);
router.post("/", consultantSlotController.createConsultantSlot);
// Thêm các route khác nếu cần

module.exports = router; 