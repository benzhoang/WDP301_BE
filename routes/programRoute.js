const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");

router.get("/", programController.getAllPrograms);
router.post("/", programController.createProgram);
router.get("/category/:categoryId", programController.getProgramsByCategory);
router.get("/creator/:creatorId", programController.getProgramsByCreator);
router.put("/:id", programController.updateProgram);
router.delete("/:id", programController.deleteProgram);
// Thêm các route khác nếu cần

module.exports = router; 