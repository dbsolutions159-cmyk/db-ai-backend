const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ error: "User already exists ❌" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User Registered ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error ❌" });
  }
});


// 🔐 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ error: "Invalid password ❌" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey123",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful 🔐",
      token,
      user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error ❌" });
  }
});


// 🔥 UPDATE PROFILE (NEW)
router.post("/update-profile", async (req, res) => {
  try {
    const { email, skills, experience, location, education } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { skills, experience, location, education },
      { new: true }
    );

    res.json({
      message: "Profile Updated ✅",
      user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update Error ❌" });
  }
});


// 🔍 GET ALL USERS (DEBUG)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users ❌" });
  }
});


module.exports = router;
