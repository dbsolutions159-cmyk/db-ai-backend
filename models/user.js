const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // 🔐 Basic Auth
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },

    // 👤 Profile Data
    skills: {
      type: String,
      default: ""
    },
    experience: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    education: {
      type: String,
      default: ""
    },

    // 📄 Resume (future use)
    resume: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true // 🔥 auto createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);