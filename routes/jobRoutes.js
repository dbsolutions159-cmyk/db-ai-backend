const express = require("express");
const router = express.Router();
const Job = require("../models/job");

// ✅ GET ALL JOBS
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().limit(20);
    res.json(jobs);
  } catch (err) {
    console.log("Job Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ✅ ADD JOB (ADMIN)
router.post("/jobs", async (req, res) => {
  try {
    const { title, company, location, salary } = req.body;

    if (!title || !company) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newJob = new Job({
      title,
      company,
      location,
      salary,
    });

    await newJob.save();

    res.json({ message: "Job added successfully ✅" });

  } catch (err) {
    console.log("Add Job Error:", err);
    res.status(500).json({ error: "Failed to add job" });
  }
});

module.exports = router;
