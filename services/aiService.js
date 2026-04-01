const fetch = require("node-fetch");

const userMemory = {};

async function getAIResponse(userId, message) {
  try {

    // 👉 user memory init
    if (!userMemory[userId]) {
      userMemory[userId] = [
        {
          role: "system",
          content: `
You are DB GPT — AI Career Assistant.

Rules:
- Never repeat same question
- Remember previous answers
- Ask next logical question
- Take full mock interviews
- Be human & short
`
        }
      ];
    }

    // 👉 add user message
    userMemory[userId].push({
      role: "user",
      content: message
    });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: userMemory[userId],
        temperature: 0.7
      })
    });

    const data = await res.json();

    if (data.error) {
      return "AI Error: " + data.error.message;
    }

    const reply = data.choices?.[0]?.message?.content || "No response";

    // 👉 save AI reply also
    userMemory[userId].push({
      role: "assistant",
      content: reply
    });

    return reply;

  } catch (err) {
    return "Server error ❌";
  }
}

module.exports = getAIResponse;
