const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  skills: {
    type: [String],
  },
  experience: {
    type: String,
  },
  location: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);
