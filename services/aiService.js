const fetch = require("node-fetch");

async function getAIResponse(userId, message) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // ✅ WORKING MODEL
        messages: [
          {
            role: "system",
            content: `
You are DB GPT — AI Career Assistant.

Rules:
- Never repeat questions
- Ask next logical question
- Be human, short, smart
- Help with jobs, resume, interviews
- If user says mock interview → start questions automatically
- Don't say "You said"
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await res.json();

    // 🔥 DEBUG (IMPORTANT)
    console.log("GROQ RESPONSE:", JSON.stringify(data));

    if (data.error) {
      return "AI Error: " + data.error.message;
    }

    return data.choices?.[0]?.message?.content || "No response from AI";

  } catch (err) {
    console.log("AI ERROR:", err.message);
    return "Server error ❌";
  }
}

module.exports = getAIResponse;
