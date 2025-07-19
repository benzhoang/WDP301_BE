const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.get("/", blogController.getAllBlogs);
router.post("/", blogController.createBlog);
router.get("/author/:authorId", blogController.getBlogsByAuthor);
router.get("/status/:status", blogController.getBlogsByStatus);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/:id/status", blogController.updateBlogStatus);
// Thêm các route khác nếu cần

module.exports = router; 