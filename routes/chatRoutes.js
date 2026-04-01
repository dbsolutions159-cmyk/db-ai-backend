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
      lastAnswer: null,
      resume: { step: 0 }
    };
  }
  return memoryStore[userId];
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

// ================= CHAT =================
router.post("/chat", async (req, res) => {

  const { message, userId = "user1" } = req.body;
  const memory = getMemory(userId);

  memory.lastAnswer = message;

  const intent = detectIntent(message);
  if(intent !== "chat") memory.intent = intent;

  const activeIntent = memory.intent;

  // ================= RESUME BUILDER =================
  if(activeIntent === "resume"){

    memory.resume.step++;

    if(memory.resume.step === 1){
      return res.json({ reply: "Let’s build your resume 👍\nWhat is your full name?" });
    }

    if(memory.resume.step === 2){
      memory.resume.name = message;
      return res.json({ reply: "Your skills?" });
    }

    if(memory.resume.step === 3){
      memory.resume.skills = message;
      return res.json({ reply: "Your experience?" });
    }

    if(memory.resume.step === 4){
      memory.resume.experience = message;

      const resumeText = `
Name: ${memory.resume.name}

Skills:
${memory.resume.skills}

Experience:
${memory.resume.experience}
`;

      memory.resume.step = 0;

      return res.json({
        reply: "Resume ready 👇 Download below",
        resume: resumeText
      });
    }
  }

  // ================= INTERVIEW =================
  if(activeIntent === "mock"){

    if(!memory.role){
      if(message.toLowerCase().includes("customer")) memory.role = "Customer Support";
      return res.json({ reply: "Which role for interview?" });
    }

    memory.step++;

    if(memory.step > 5){
      memory.step = 0;
      return res.json({ reply: "Interview complete 🎉" });
    }

    // 🔥 SCORING
    const scorePrompt = `
Evaluate this answer:

"${memory.lastAnswer}"

Give:
- Score /10
- 1 improvement
`;

    const feedback = await getAIResponse(userId, scorePrompt);

    // 🔥 NEXT QUESTION
    const nextQ = await getAIResponse(userId, `Ask next interview question for ${memory.role}`);

    return res.json({
      reply: `${feedback}\n\nNext 👇\n${nextQ}`
    });
  }

  // ================= CHAT =================
  const aiReply = await getAIResponse(userId, message);

  return res.json({ reply: aiReply });

});

// ================= PDF DOWNLOAD =================
router.post("/download-resume", (req, res) => {

  const { resume } = req.body;

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Resume", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(resume);

  doc.end();
});

module.exports = router;
