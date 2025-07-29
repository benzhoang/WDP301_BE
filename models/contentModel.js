const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String },
    type: {
      type: String,
      enum: ["video", "text", "quiz", "assignment", "file", "link"],
      required: true,
    },
    content_type: { type: String },
    program_id: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    order: { type: Number },
    metadata: { type: String },
    file_url: { type: String },
    preview_image: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
