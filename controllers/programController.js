const Program = require("../models/programModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");

exports.createProgram = async (req, res) => {
  try {
    const { name, description, category, start_date, end_date, status, image, creator } = req.body;
    let categoryExists = null, creatorExists = null;
    if (category) categoryExists = await Category.findById(category);
    if (creator) creatorExists = await User.findById(creator);
    if (category && !categoryExists) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    if (creator && !creatorExists) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    const program = new Program({ name, description, category, start_date, end_date, status, image, creator });
    await program.save();
    res.status(201).json({ success: true, program });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate("category creator");
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy chương trình theo category
exports.getProgramsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const programs = await Program.find({ category: categoryId }).populate("category creator");
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy chương trình theo creator
exports.getProgramsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const programs = await Program.find({ creator: creatorId }).populate("category creator");
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật chương trình
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const program = await Program.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: program });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Xóa chương trình (hard delete)
exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findByIdAndDelete(id);
    res.json({ success: true, message: "Program deleted", data: program });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 