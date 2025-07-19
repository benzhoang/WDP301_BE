const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/", cartController.createCart);
router.get("/", cartController.getCartByUser);
// Thêm các route khác nếu cần

module.exports = router; 