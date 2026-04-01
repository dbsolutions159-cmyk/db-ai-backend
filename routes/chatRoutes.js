const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const getAIResponse = require("../services/aiService");
const PDFDocument = require("pdfkit");

// ================= MEMORY =================
const memoryStore = {};

function getMemory(userId){
  if(!memoryStore[userId]){
    memoryStore[userId] = {
      role: null,
      intent: null,
      step: 0,
      resumeData: ""
    };
  }
  return memoryStore[userId];
}

// ================= INTENT =================
function detectIntent(msg){
  msg = (msg || "").toLowerCase();

  if(msg.includes("job")) return "job";
  if(msg.includes("resume")) return "resume";
  if(msg.includes("interview") || msg.includes("mock")) return "mock";

  return "chat";
}

// ================= CHAT =================
router.post("/chat", async (req, res) => {

  try{

    const { message, userId = "user1" } = req.body;

    if(!message){
      return res.json({ reply: "Message required ❌" });
    }

    console.log("User:", message);

    const memory = getMemory(userId);

    const intent = detectIntent(message);
    if(intent !== "chat") memory.intent = intent;

    const activeIntent = memory.intent;

    // ================= JOB FETCH =================
    if(activeIntent === "job"){

      const jobs = await Job.find().limit(5);

      console.log("Jobs found:", jobs.length);

      if(!jobs.length){
        return res.json({ reply: "❌ No jobs available right now" });
      }

      let reply = "🔥 Top Jobs For You 👇\n\n";

      jobs.forEach((job, i) => {
        reply += `${i+1}. ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n🔗 ${job.url}\n\n`;
      });

      memory.intent = null;

      return res.json({ reply });
    }

    // ================= RESUME (PRO AI) =================
    if(activeIntent === "resume"){

      const prompt = `
Create a professional resume using this information:

${message}

Rules:
- Minimum 8-12 lines
- Add sections:
  Name
  Summary
  Skills
  Experience
  Strengths
- Make it professional and clean
`;

      const resume = await getAIResponse(userId, prompt);

      memory.resumeData = resume;
      memory.intent = null;

      return res.json({
        reply: "✅ Professional Resume Ready",
        resume
      });
    }

    // ================= MOCK INTERVIEW =================
    if(activeIntent === "mock"){

      if(!memory.role){
        memory.role = message;
        return res.json({
          reply: `Great 👍 Starting ${memory.role} interview\n\n👉 Tell me about yourself`
        });
      }

      memory.step++;

      if(memory.step > 5){
        memory.step = 0;
        memory.role = null;
        memory.intent = null;

        return res.json({
          reply: "🎉 Interview completed — You did well!"
        });
      }

      const feedback = await getAIResponse(userId, `
Evaluate this answer:

"${message}"

Give:
- Score /10
- 1 improvement
`);

      const nextQ = await getAIResponse(userId, `
Ask next interview question for ${memory.role}
`);

      return res.json({
        reply: `${feedback}\n\n👉 Next Question:\n${nextQ}`
      });
    }

    // ================= NORMAL AI =================
    const aiReply = await getAIResponse(userId, message);

    return res.json({
      reply: aiReply || "🤖 No response"
    });

  }catch(err){
    console.log("CHAT ERROR:", err.message);
    return res.json({
      reply: "Server error ❌"
    });
  }

});

// ================= PDF DOWNLOAD =================
router.post("/download-resume", (req, res) => {

  try{

    const { resume } = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Resume", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(resume || "No data");

    doc.end();

  }catch(err){
    console.log("PDF ERROR:", err.message);
    res.status(500).send("PDF Error");
  }

});

module.exports = router;
