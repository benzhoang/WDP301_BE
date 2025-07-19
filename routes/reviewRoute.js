const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.get("/", reviewController.getAllReviews);
router.post("/", reviewController.createReview);
// Thêm các route khác nếu cần

module.exports = router; 