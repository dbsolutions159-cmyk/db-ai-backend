const express = require("express");
const router = express.Router();
const Job = require("../models/job");

// 🔍 Search jobs
router.get("/jobs", async (req, res) => {
  try {
    const { keyword, location } = req.query;

    let filter = {};

    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(20);

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;