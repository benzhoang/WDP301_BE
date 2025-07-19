const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.get("/", contentController.getAllContents);
router.post("/", contentController.createContent);
router.get("/program/:programId", contentController.getContentByProgram);
router.get("/type/:type", contentController.getContentByType);
router.get("/content-type/:contentType", contentController.getContentByContentType);
router.put("/:id", contentController.updateContent);
router.delete("/:id", contentController.deleteContent);
router.patch("/:id/order", contentController.updateContentOrder);
// Thêm các route khác nếu cần

module.exports = router; 