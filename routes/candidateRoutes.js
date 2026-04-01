const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

// 🔥 Save Candidate
router.post("/save", async (req, res) => {
  try {
    const { name, phone, skills, experience, location } = req.body;

    const newCandidate = new Candidate({
      name,
      phone,
      skills,
      experience,
      location
    });

    await newCandidate.save();

    console.log("✅ Candidate Saved:", name);

    res.json({ message: "Candidate saved successfully" });

  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ message: "Error saving candidate" });
  }
});

module.exports = router;
