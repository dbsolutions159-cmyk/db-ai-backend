const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
});

const chatSchema = new mongoose.Schema({
  userId: String,
  messages: [messageSchema],
  profile: {
    name: String,
    skills: String,
    experience: String,
    location: String
  }
});

module.exports = mongoose.model("Chat", chatSchema);