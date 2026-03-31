const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// 🔍 Extract role & location from message
function extractQuery(msg) {
  const m = msg.toLowerCase();

  let role = "";
  let location = "";

  // role detect
  if (m.includes("customer")) role = "customer";
  if (m.includes("support")) role = "support";
  if (m.includes("sales")) role = "sales";
  if (m.includes("bpo")) role = "bpo";
  if (m.includes("developer")) role = "developer";

  // location detect
  if (m.includes("bhopal")) location = "bhopal";
  if (m.includes("indore")) location = "indore";
  if (m.includes("bangalore")) location = "bangalore";
  if (m.includes("remote")) location = "remote";

  return { role, location };
}


// ✅ GET ALL JOBS (test)
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});


// 🤖 CHAT ROUTE (FINAL)
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Message required ❌", jobs: [] });
    }

    // 🔍 extract query
    const { role, location } = extractQuery(message);

    let query = {};

    if (role) {
      query.title = { $regex: role, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    console.log("User message:", message);
    console.log("Query:", query);

    // 🔥 MAIN SEARCH
    let jobs = await Job.find(query).limit(3);

    // 🔥 FALLBACK (important)
    if (jobs.length === 0) {
      console.log("No match → showing default jobs");
      jobs = await Job.find().limit(3);
    }

    console.log("Jobs returned:", jobs.length);

    // 🧠 SMART REPLY (NO AI crash)
    let reply = "";

    if (role && location) {
      reply = `🔥 ${location} me ${role} jobs mil gayi:`;
    } 
    else if (location) {
      reply = `🔥 ${location} me jobs mil gayi:`;
    } 
    else if (role) {
      reply = `🔥 ${role} related jobs mil gayi:`;
    } 
    else {
      reply = "🔥 Ye kuch latest jobs hain:";
    }

    // 📤 RESPONSE
    res.json({
      reply,
      jobs
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({
      reply: "Server error ❌",
      jobs: []
    });
  }
});

module.exports = router;