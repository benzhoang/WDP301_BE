const express = require("express");
const router = express.Router();
const consultantSlotController = require("../controllers/consultantSlotController");

router.get("/", consultantSlotController.getAllConsultantSlots);
router.post("/", consultantSlotController.createConsultantSlot);
router.get("/consultant/:consultantId", consultantSlotController.getSlotsByConsultantId);
router.post("/bulk/:consultantId", consultantSlotController.createConsultantSlots);
router.delete("/consultant/:consultantId", consultantSlotController.deleteConsultantSlots);
router.put("/update", consultantSlotController.updateConsultantSlots);
// Thêm các route khác nếu cần

module.exports = router; 