const express = require("express");
const router = express.Router();
const actionController = require("../controllers/actionController");

router.get("/", actionController.getAllActions);
router.post("/", actionController.createAction);
// Thêm các route khác nếu cần

module.exports = router; 