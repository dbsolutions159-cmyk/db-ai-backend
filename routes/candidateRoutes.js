const express = require("express");
const router = express.Router();
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

// ================= CLEAN RESPONSE =================
function cleanText(text){
  return text
    .replace(/<[^>]*>?/gm, "") // remove HTML
    .replace(/\n{3,}/g, "\n\n");
}

// ================= DUMMY JOBS =================
const jobs = [
  { title: "Customer Support Executive", company: "Teleperformance", location: "Bhopal", salary: "₹22,000" },
  { title: "HR Recruiter", company: "DB Solutions", location: "Indore", salary: "₹18,000" },
  { title: "Sales Executive", company: "HDFC Bank", location: "Delhi", salary: "₹25,000" }
];

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

    // ================= JOB =================
    if(activeIntent === "job"){

      let reply = "🔥 Top Jobs For You 👇\n\n";

      jobs.forEach((job, i) => {
        reply += `${i+1}. ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n💰 ${job.salary}\n\n`;
      });

      memory.intent = null;

      return res.json({ reply });
    }

    // ================= RESUME =================
    if(activeIntent === "resume"){

      const prompt = `
Create a professional resume.

User input:
${message}

Rules:
- No HTML
- Clean text only
- Structured format
`;

      const resume = cleanText(await getAIResponse(userId, prompt));

      memory.resumeData = resume;
      memory.intent = null;

      return res.json({
        reply: "✅ Resume Ready",
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
          reply: "🎉 Interview completed — Good job!"
        });
      }

      const feedback = cleanText(await getAIResponse(userId, `
Evaluate answer:

"${message}"

Return:
Score: X/10
Improvement: short tip
`));

      const nextQ = cleanText(await getAIResponse(userId, `
Next interview question for ${memory.role}
`));

      return res.json({
        reply: `${feedback}\n\n👉 ${nextQ}`
      });
    }

    // ================= NORMAL AI =================
    const aiReply = cleanText(await getAIResponse(userId, message));

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

// ================= PDF =================
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
