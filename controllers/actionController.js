const Action = require("../models/actionModel");

exports.createAction = async (req, res) => {
  try {
    const { description, range, type } = req.body;
    if (!description || !type) {
      return res.status(400).json({ success: false, message: "Description and type are required fields" });
    }
    if (range !== undefined && range !== null && isNaN(parseInt(range))) {
      return res.status(400).json({ success: false, message: "Range must be a valid integer" });
    }
    const action = new Action({ description, range: range !== undefined ? parseInt(range) : null, type });
    await action.save();
    res.status(201).json({ success: true, action });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllActions = async (req, res) => {
  try {
    const actions = await Action.find();
    res.json({ success: true, data: actions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await Action.findById(id);
    if (!action) return res.status(404).json({ success: false, message: "Action not found" });
    res.status(200).json({ success: true, data: action });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, range, type } = req.body;
    if (range !== undefined && range !== null && isNaN(parseInt(range))) {
      return res.status(400).json({ success: false, message: "Range must be a valid integer" });
    }
    const update = {};
    if (description !== undefined) update.description = description;
    if (range !== undefined) update.range = range !== null ? parseInt(range) : null;
    if (type !== undefined) update.type = type;
    const action = await Action.findByIdAndUpdate(id, update, { new: true });
    if (!action) return res.status(404).json({ success: false, message: "Action not found" });
    res.status(200).json({ success: true, data: action });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteAction = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await Action.findById(id);
    if (!action) return res.status(404).json({ success: false, message: "Action not found" });
    await action.deleteOne();
    res.status(200).json({ success: true, message: `Action with ID ${id} deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getActionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!type) return res.status(400).json({ success: false, message: "Type parameter is required" });
    const actions = await Action.find({ type }).sort({ range: 1 });
    res.status(200).json({ success: true, data: actions, count: actions.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getActionsByRange = async (req, res) => {
  try {
    const { minRange, maxRange } = req.query;
    const query = {};
    if (minRange !== undefined) query.range = { ...query.range, $gte: parseInt(minRange) };
    if (maxRange !== undefined) query.range = { ...query.range, $lte: parseInt(maxRange) };
    const actions = await Action.find(query).sort({ range: 1 });
    res.status(200).json({ success: true, data: actions, count: actions.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 