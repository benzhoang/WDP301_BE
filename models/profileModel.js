const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String },
  bio_json: { type: String },
  date_of_birth: { type: Date },
  job: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema); 