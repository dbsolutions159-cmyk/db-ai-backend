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
      lastAction: null,
      lastAnswer: null
    };
  }
  return userMemory[userId];
}

// ================= UPDATE MEMORY =================
function updateMemory(memory, message){

  const msg = message.toLowerCase();

  // ROLE
  if(msg.includes("bpo") || msg.includes("customer")){
    memory.role = "customer support";
  }
  if(msg.includes("sales")){
    memory.role = "sales";
  }
  if(msg.includes("developer")){
    memory.role = "developer";
  }

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

  return "general";
}

// ================= CHAT API =================
router.post("/chat", async (req, res) => {

  try {

    const { message, userId = "user1" } = req.body;

    if(!message){
      return res.json({ reply: "Message required ❌" });
    }

    const memory = getMemory(userId);
    updateMemory(memory, message);

    const intent = detectIntent(message);
    memory.intent = intent;

    // ================= NO REPEAT =================
    if(memory.lastAction === "ask_role" && memory.role){
      memory.lastAction = null;
    }

    if(memory.lastAction === "ask_location" && memory.location){
      memory.lastAction = null;
    }

    // ================= JOB =================
    if(intent === "job" || memory.intent === "job"){

      memory.intent = "job";

      if(!memory.role){
        memory.lastAction = "ask_role";
        return res.json({ reply: "Kis role me job chahiye?" });
      }

      if(!memory.location){
        memory.lastAction = "ask_location";
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

      if(!memory.role){
        memory.lastAction = "ask_role";
        return res.json({ reply: "Kis role ke liye interview hai?" });
      }

      return res.json({
        reply: `Great 👍 ${memory.role} interview ke liye ready ho jao.

👉 Tell me about yourself`
      });
    }

    // ================= 🔥 AI MOCK INTERVIEW =================
    if(intent === "mock" || memory.intent === "mock"){

      memory.intent = "mock";

      if(!memory.role){
        memory.lastAction = "ask_role";
        return res.json({ reply: "Kis role ke liye mock interview dena hai?" });
      }

      memory.step = (memory.step || 0) + 1;

      if(memory.step > 5){
        memory.step = 0;
        return res.json({
          reply: "Interview complete 🎉 Great job!"
        });
      }

      const prompt = `
You are a professional interviewer.

Take a mock interview for:
Role: ${memory.role}
Experience: ${memory.experience || "unknown"}

Rules:
- Ask only ONE question
- Don't repeat questions
- Start basic → then advanced
- Make it realistic (HR + practical)
- Ask based on previous answer

Question number: ${memory.step}
User last answer: ${memory.lastAnswer || "none"}
`;

      const aiReply = await getAIResponse(userId, prompt);

      return res.json({
        reply: aiReply
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
