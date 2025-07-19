const Action = require("../models/actionModel");

exports.createAction = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const action = new Action({ name, description, type });
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