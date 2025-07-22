const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.get("/", blogController.getAllBlogs);
router.post("/", blogController.createBlog);
router.get("/author/:authorId", blogController.getBlogsByAuthor);
router.get("/status/:status", blogController.getBlogsByStatus);
router.get("/my", blogController.getMyBlogs);
router.get("/pending", blogController.getPendingBlogs);
router.get("/moderation/stats", blogController.getModerationStats);
router.get("/admin/blogs", blogController.getAllBlogsForAdmin);
router.get("/:id", blogController.getBlogById);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/:id/status", blogController.updateBlogStatus);
router.patch("/:id/approve", blogController.approveBlog);
router.patch("/:id/reject", blogController.rejectBlog);
router.post("/with-image", blogController.createBlogWithImage);

module.exports = router; 