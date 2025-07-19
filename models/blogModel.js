const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, default: "draft" }, // draft, published, etc.
  image: { type: String },
  tags: [{ type: String }],
  published_at: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model("Blog", blogSchema); 