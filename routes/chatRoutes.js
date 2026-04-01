const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // Node < 18 के लिए

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("User:", message);

    if (!message) {
      return res.json({ reply: "Message missing" });
    }

    let aiReply = "Default reply";

    try {
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // 🔥 updated stable model
          messages: [
            {
              role: "system",
              content: "Reply in Hinglish, friendly tone, like a human recruiter"
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      // 🔥 IMPORTANT: API STATUS CHECK
      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.log("API ERROR:", errText);

        return res.json({
          reply: "⚠ AI service error (check backend logs)"
        });
      }

      const data = await aiRes.json();

      console.log("AI RAW:", data);

      aiReply =
        data?.choices?.[0]?.message?.content ||
        "⚠ AI response empty";

    } catch (aiErr) {
      console.log("AI ERROR:", aiErr);
      aiReply = "⚠ AI temporarily unavailable";
    }

    res.json({ reply: aiReply });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ reply: "Server error ❌" });
  }
});

module.exports = router;
