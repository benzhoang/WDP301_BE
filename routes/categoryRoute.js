const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
// Thêm các route khác nếu cần

module.exports = router; 