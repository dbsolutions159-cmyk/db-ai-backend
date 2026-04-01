const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// 🔥 CHAT ROUTE
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("👤 User:", message);

    if (!message) {
      return res.json({ reply: "Please enter a message." });
    }

    let aiReply = "Sorry, something went wrong.";

    try {
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 500,

          messages: [
            {
              role: "system",
              content: `
You are DB AI Hiring Consultant by DB Solutions — a premium recruitment assistant.

Communication Style:
- Use polished Hinglish (mostly English)
- No slang or casual tone
- Professional, confident, and helpful

Rules:
- Be structured and concise
- Ask relevant questions step-by-step
- Focus on helping the user get a job
- Suggest jobs when possible
- Build trust like a professional recruiter

Conversation Flow:
1. Understand job role, skills, experience, location
2. Ask missing details
3. Suggest relevant opportunities
4. Guide user clearly

Response Format:
- Start professionally
- Use bullet points if needed
- Keep response short and useful
- End with next step

Example:
"Thank you for your interest. Could you please share your preferred job role and experience level so I can assist you better?"
`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      // 🔴 API ERROR HANDLE
      if (!aiRes.ok) {
        const errorText = await aiRes.text();
        console.log("❌ GROQ API ERROR:", errorText);

        return res.json({
          reply: "AI service temporarily unavailable. Please try again."
        });
      }

      const data = await aiRes.json();

      console.log("🤖 AI Response:", data);

      aiReply =
        data?.choices?.[0]?.message?.content ||
        "No response from AI.";

    } catch (aiError) {
      console.log("❌ AI FETCH ERROR:", aiError);
      aiReply = "AI is currently unavailable.";
    }

    return res.json({ reply: aiReply });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    return res.status(500).json({ reply: "Server error" });
  }
});

module.exports = router;
