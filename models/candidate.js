Pconst mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  phone: String,
  skills: [String],
  experience: String,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Candidate", candidateSchema);
