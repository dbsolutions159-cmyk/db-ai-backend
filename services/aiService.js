const fetch = require("node-fetch");

const memory = {};

async function getAIResponse(userId, message, jobs = []) {
  try {

    // 🧠 memory store
    if (!memory[userId]) memory[userId] = [];
    memory[userId].push({ role: "user", content: message });

    // 🧾 jobs context
    let jobsText = "";
    if (jobs.length > 0) {
      jobsText = jobs.map(j =>
        `${j.title} in ${j.location || "India"}`
      ).join(", ");
    }

    // 🤖 API call (Groq)
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are DB Job GPT.

Rules:
- Talk like a friendly recruiter
- Give short smart answers
- Don't repeat questions
- Use job data if available
- Suggest next step

Jobs available:
${jobsText}
`
          },
          ...memory[userId].slice(-5) // last 5 messages
        ]
      })
    });

    const data = await res.json();

    const reply = data?.choices?.[0]?.message?.content || "Try again";

    memory[userId].push({ role: "assistant", content: reply });

    return reply;

  } catch (err) {
    console.log(err);
    return "AI error ❌";
  }
}

module.exports = getAIResponse;
