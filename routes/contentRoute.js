const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.get("/", contentController.getAllContents);
router.post("/", contentController.createContent);
router.get("/program/:programId", contentController.getContentByProgram);
router.get("/type/:type", contentController.getContentByType);
router.get("/content-type/:contentType", contentController.getContentByContentType);
router.get("/:id", contentController.getContentById);
router.get("/:id/with-program", contentController.getContentWithProgram);
router.get("/:id/parsed-metadata", contentController.getParsedMetadataContentById);
router.get("/file/:id", contentController.getContentFile);
router.post("/youtube", contentController.createYouTubeContent);
router.post("/markdown", contentController.createMarkdownContent);
router.post("/podcast", contentController.createPodcastContent);
router.put("/:id", contentController.updateContent);
router.delete("/:id", contentController.deleteContent);
router.patch("/:id/order", contentController.updateContentOrder);
router.post("/images/upload", contentController.uploadImage);
router.get("/images/:filename", contentController.getImage);

module.exports = router; 