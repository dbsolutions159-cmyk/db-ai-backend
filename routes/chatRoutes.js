const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const getAIResponse = require("../services/aiService");

// 🧠 MEMORY
const userMemory = {};

// 🔍 INTENT DETECT
function detectIntent(msg){
  msg = msg.toLowerCase();

  if(msg.includes("job")) return "job";
  if(msg.includes("resume")) return "resume";
  if(msg.includes("interview")) return "interview";
  if(msg.includes("mock")) return "mock";

  return "general";
}

router.post("/chat", async (req, res) => {

  try {

    const { message, userId = "user1" } = req.body;

    if(!message){
      return res.json({ reply: "Message required ❌" });
    }

    // 🧠 MEMORY INIT
    if(!userMemory[userId]){
      userMemory[userId] = {};
    }

    const memory = userMemory[userId];
    const msg = message.toLowerCase();

    // 🔥 UPDATE MEMORY
    if(msg.includes("bpo")) memory.role = "bpo";
    if(msg.includes("sales")) memory.role = "sales";
    if(msg.includes("developer")) memory.role = "developer";

    if(msg.includes("bhopal")) memory.location = "bhopal";
    if(msg.includes("indore")) memory.location = "indore";

    const intent = detectIntent(message);

    // ================= JOB FLOW =================
    if(intent === "job"){

      if(!memory.role){
        return res.json({ reply: "Kis role me job chahiye?" });
      }

      if(!memory.location){
        return res.json({ reply: "Kis city me job chahiye?" });
      }

      let query = {
        title: { $regex: memory.role, $options: "i" },
        location: { $regex: memory.location, $options: "i" }
      };

      let jobs = await Job.find(query).limit(3);

      if(jobs.length === 0){
        jobs = await Job.find().limit(3);
      }

      return res.json({
        reply: `🔥 ${memory.location} me ${memory.role} jobs mil gayi`,
        jobs
      });
    }

    // ================= RESUME =================
    if(intent === "resume"){
      return res.json({
        reply: "Perfect 👍 apna naam, skills aur experience bhejo"
      });
    }

    // ================= INTERVIEW =================
    if(intent === "interview"){
      return res.json({
        reply: "Kis role ke liye interview hai?"
      });
    }

    // ================= MOCK =================
    if(intent === "mock"){
      return res.json({
        reply: "Chalo mock start karte hain 👍 Tell me about yourself"
      });
    }

    // ================= AI FALLBACK =================
    const aiReply = await getAIResponse(userId, message);

    return res.json({
      reply: aiReply
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      reply: "Server error ❌"
    });
  }

});

module.exports = router;
