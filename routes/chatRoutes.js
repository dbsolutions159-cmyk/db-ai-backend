const express = require("express");
const router = express.Router();
const Job = require("../models/job");

// 🔍 Extract role & location
function extractQuery(msg) {
  const m = msg.toLowerCase();

  let role = "";
  let location = "";

  // role detect
  if (m.includes("customer")) role = "customer";
  else if (m.includes("support")) role = "support";
  else if (m.includes("sales")) role = "sales";
  else if (m.includes("bpo")) role = "bpo";
  else if (m.includes("developer")) role = "developer";

  // location detect
  if (m.includes("bhopal")) location = "bhopal";
  else if (m.includes("indore")) location = "indore";
  else if (m.includes("bangalore")) location = "bangalore";
  else if (m.includes("remote")) location = "remote";

  return { role, location };
}


// ✅ GET ALL JOBS (TEST ROUTE)
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().limit(10);
    
    console.log("Jobs fetched:", jobs.length);

    res.json(jobs);
  } catch (err) {
    console.log("Jobs API Error:", err);
    res.status(500).json({ error: "Failed to fetch jobs ❌" });
  }
});


// 🤖 CHAT ROUTE
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
