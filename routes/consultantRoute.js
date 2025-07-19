const express = require("express");
const router = express.Router();
const consultantController = require("../controllers/consultantController");

router.get("/", consultantController.getAllConsultants);
router.post("/", consultantController.createConsultant);
// Thêm các route khác nếu cần

module.exports = router; 