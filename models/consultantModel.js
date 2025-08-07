const mongoose = require("mongoose");

const consultantSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  google_meet_link: { type: String },
  certification: { type: String },
  speciality: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Consultant", consultantSchema); 