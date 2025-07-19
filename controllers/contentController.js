const Content = require("../models/contentModel");
const Program = require("../models/programModel");

exports.createContent = async (req, res) => {
  try {
    const { title, body, type, content_type, program, order, metadata, file_url, preview_image } = req.body;
    let programExists = null;
    if (program) programExists = await Program.findById(program);
    if (program && !programExists) {
      return res.status(404).json({ success: false, error: "Program not found" });
    }
    const content = new Content({ title, body, type, content_type, program, order, metadata, file_url, preview_image });
    await content.save();
    res.status(201).json({ success: true, content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllContents = async (req, res) => {
  try {
    const contents = await Content.find().populate("program");
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy content theo chương trình
exports.getContentByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const contents = await Content.find({ program: programId }).populate("program");
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy content theo type
exports.getContentByType = async (req, res) => {
  try {
    const { type } = req.params;
    const contents = await Content.find({ type });
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Lấy content theo content_type
exports.getContentByContentType = async (req, res) => {
  try {
    const { contentType } = req.params;
    const contents = await Content.find({ content_type: contentType });
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật content
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const content = await Content.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// Xóa content
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    res.json({ success: true, message: "Content deleted", data: content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Cập nhật thứ tự content
exports.updateContentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    const content = await Content.findByIdAndUpdate(id, { order }, { new: true });
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 