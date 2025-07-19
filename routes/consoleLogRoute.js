const express = require("express");
const router = express.Router();
const consoleLogController = require("../controllers/consoleLogController");

router.get("/", consoleLogController.getAllConsoleLogs);
router.post("/", consoleLogController.createConsoleLog);
// Thêm các route khác nếu cần

module.exports = router; 