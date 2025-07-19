const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.get("/", paymentController.getAllPayments);
router.post("/", paymentController.createPayment);
// Thêm các route khác nếu cần

module.exports = router; 