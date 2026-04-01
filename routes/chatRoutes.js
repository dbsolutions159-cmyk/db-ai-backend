const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const getAIResponse = require("../services/aiService");

// ================= MEMORY =================
const userMemory = {};

function getMemory(userId){
  if(!userMemory[userId]){
    userMemory[userId] = {
      role: null,
      location: null,
      experience: null,
      intent: null,
      step: 0,
      lastQuestion: null,
      lastAnswer: null
    };
  }
  return userMemory[userId];
}

// ================= UPDATE MEMORY =================
function updateMemory(memory, message){

  const msg = message.toLowerCase();

  // ROLE
  if(msg.includes("bpo") || msg.includes("customer")) memory.role = "customer support";
  if(msg.includes("sales")) memory.role = "sales";
  if(msg.includes("developer")) memory.role = "developer";

  // LOCATION
  if(msg.includes("bhopal")) memory.location = "bhopal";
  if(msg.includes("indore")) memory.location = "indore";

  // EXPERIENCE
  if(msg.includes("fresher")) memory.experience = "fresher";
  if(msg.includes("1 year")) memory.experience = "1 year";
  if(msg.includes("2 year")) memory.experience = "2 years";

  memory.lastAnswer = message;
}

// ================= INTENT =================
function detectIntent(msg){
  msg = msg.toLowerCase();

  if(msg.includes("job")) return "job";
  if(msg.includes("resume")) return "resume";
  if(msg.includes("interview")) return "interview";
  if(msg.includes("mock")) return "mock";

  return "chat";
}

// ================= CHAT API =================
router.post("/chat", async (req, res) => {

  try {

    const { message, userId = "user1" } = req.body;

    if(!message){
      return res.json({ reply: "Message required ❌" });
    }

    const memory = getMemory(userId);

    // 🔄 update memory
    updateMemory(memory, message);

    // 🎯 intent detect
    const intent = detectIntent(message);

    if(intent !== "chat"){
      memory.intent = intent;
    }

    const activeIntent = memory.intent;

    // ================= JOB =================
    if(activeIntent === "job"){

      if(!memory.role){
        return res.json({ reply: "Which role are you looking for?" });
      }

      if(!memory.location){
        return res.json({ reply: "Which city do you prefer?" });
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
        reply: `Found some ${memory.role} roles in ${memory.location} 👍`,
        jobs
      });
    }

    // ================= RESUME =================
    if(activeIntent === "resume"){
      return res.json({
        reply: "Sure 👍 Please share your name, skills, and experience."
      });
    }

    // ================= INTERVIEW =================
    if(activeIntent === "interview"){

      if(!memory.role){
        return res.json({ reply: "Which role is the interview for?" });
      }

      memory.step = 1;

      return res.json({
        reply: `Great 👍 Let’s begin.\n\nTell me about yourself.`
      });
    }

    // ================= MOCK INTERVIEW =================
    if(activeIntent === "mock"){

      if(!memory.role){
        return res.json({ reply: "Which role should I take the mock interview for?" });
      }

      memory.step = (memory.step || 0) + 1;

      if(memory.step > 6){
        memory.step = 0;
        return res.json({
          reply: "Interview complete 🎉 Well done."
        });
      }

      const prompt = `
You are a professional interviewer.

Role: ${memory.role}
Experience: ${memory.experience || "unknown"}

Rules:
- Ask only ONE question
- Keep it short
- No repetition
- Professional + friendly tone
- Ask next logical question
- Don't explain too much

Previous question: ${memory.lastQuestion || "none"}
User answer: ${memory.lastAnswer || "none"}

Now ask next question.
`;

      const aiReply = await getAIResponse(userId, prompt);

      memory.lastQuestion = aiReply;

      return res.json({
        reply: aiReply
      });
    }

    // ================= SMART CHAT =================
    const prompt = `
You are DB GPT — Professional AI Career Assistant.

Tone:
- Professional + friendly
- Short answers (max 2–3 lines)
- Smart and clear
- No long explanation

User: ${message}
`;

    const aiReply = await getAIResponse(userId, prompt);

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
