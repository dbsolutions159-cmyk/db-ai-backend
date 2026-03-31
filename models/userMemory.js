const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  userId: String,
  role: String,
  location: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UserMemory", memorySchema);