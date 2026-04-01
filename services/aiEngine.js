const fetch = require("node-fetch");

// 🧠 MEMORY STORE
const memoryStore = {};

// 🎯 INTENT DETECTOR
function detectIntent(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("job")) return "job";
  if (msg.includes("resume")) return "resume";
  if (msg.includes("interview")) return "interview";
  if (msg.includes("mock")) return "mock";

  return "chat";
}

// 🧠 GET MEMORY
function getMemory(userId) {
  if (!memoryStore[userId]) {
    memoryStore[userId] = {
      messages: [],
      mode: null,
      role: null,
      step: 0
    };
  }
  return memoryStore[userId];
}

// 🔄 UPDATE MEMORY
function updateMemory(memory, message) {
  const msg = message.toLowerCase();

  if (msg.includes("bpo") || msg.includes("customer")) {
    memory.role = "Customer Support";
  }

  if (msg.includes("sales")) memory.role = "Sales";
  if (msg.includes("developer")) memory.role = "Developer";
}

// 🤖 MAIN ENGINE
async function runAI(userId, message) {
  try {
    const memory = getMemory(userId);

    // 🔍 intent
    const intent = detectIntent(message);
    memory.mode = intent;

    // 🔄 update memory
    updateMemory(memory, message);

    // ================= JOB MODE =================
    if (intent === "job") {
      if (!memory.role) {
        return "Which role are you looking for?";
      }
      return `Found some good ${memory.role} roles 👍  
Do you prefer a specific city?`;
    }

    // ================= RESUME MODE =================
    if (intent === "resume") {
      return "Sure 👍 Share your name, skills, and experience — I’ll create it for you.";
    }

    // ================= INTERVIEW MODE =================
    if (intent === "interview") {
      if (!memory.role) {
        return "Which role is the interview for?";
      }

      return `Great 👍 Let’s start  
Tell me about yourself.`;
    }

    // ================= MOCK INTERVIEW =================
    if (intent === "mock") {
      if (!memory.role) {
        return "Which role should I take the mock interview for?";
      }

      memory.step += 1;

      const prompt = `
You are a professional interviewer.

Role: ${memory.role}

Ask ONE interview question at a time.

Rules:
- Keep it short
- No repetition
- Professional + friendly tone
- Ask next logical question

Question number: ${memory.step}
`;

      const aiReply = await callAI(prompt);

      return aiReply;
    }

    // ================= CHAT MODE =================
    const prompt = `
You are DB GPT — Professional AI Career Assistant.

Tone:
- Professional + friendly
- Short answers (max 2–3 lines)
- Smart and helpful

User: ${message}
`;

    const aiReply = await callAI(prompt);

    return aiReply;

  } catch (err) {
    console.log("AI ENGINE ERROR:", err);
    return "Something went wrong ❌";
  }
}

// 🤖 API CALL
async function callAI(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await res.json();

  if (data.error) {
    return "AI error ❌";
  }

  return data.choices?.[0]?.message?.content || "No response";
}

module.exports = runAI;
