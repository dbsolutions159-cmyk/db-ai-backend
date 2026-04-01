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
  msg = (msg || "").toLowerCase();
  if(msg.includes("job")) return "job";
  if(msg.includes("resume")) return "resume";
  if(msg.includes("interview")) return "interview";
  if(msg.includes("mock")) return "mock";
  return "chat";
}

// ================= CHAT =================
router.post("/chat", async (req, res) => {

  try{

    const { message, userId = "user1" } = req.body;

    if(!message){
      return res.json({ reply: "Message required ❌" });
    }

    console.log("Incoming:", message);

    const memory = getMemory(userId);

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

    // ================= MOCK INTERVIEW =================
    if(activeIntent === "mock"){

      if(!memory.role){
        memory.role = message;
        return res.json({ reply: "Starting interview 👍\nTell me about yourself" });
      }

      memory.step++;

      if(memory.step > 5){
        memory.step = 0;
        memory.role = null;
        return res.json({ reply: "Interview complete 🎉" });
      }

      const scorePrompt = `
Evaluate this answer:

"${message}"

Give:
- Score /10
- 1 improvement
`;

      let feedback = await getAIResponse(userId, scorePrompt);
      let nextQ = await getAIResponse(userId, `Ask next interview question for ${memory.role}`);

      return res.json({
        reply: `${feedback}\n\nNext 👇\n${nextQ}`
      });
    }

    // ================= NORMAL CHAT =================
    let aiReply = await getAIResponse(userId, message);

    console.log("AI:", aiReply);

    return res.json({
      reply: aiReply || "No response 🤖"
    });

  }catch(err){
    console.log("CHAT ERROR:", err.message);
    return res.json({
      reply: "Server error ❌ try again"
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
