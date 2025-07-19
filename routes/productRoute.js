const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
// Thêm các route khác nếu cần

module.exports = router; 