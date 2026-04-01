const fetch = require("node-fetch");

async function getAIResponse(userId, message){

  try{

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `
You are DB Hire AI — a professional career assistant.

RULES:
- Speak like expert + friendly
- Give structured answers
- No repeat questions
- No short useless replies
- Always provide value

FOR RESUME:
- Write full professional resume
- Minimum 6-10 lines
- Proper sections:
  Name, Skills, Experience, Summary

FOR JOB:
- Suggest best jobs
- Explain why match

FOR INTERVIEW:
- Ask smart questions
- Give feedback + score

Tone:
- Professional but friendly
- Clear and helpful
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await res.json();

    return data?.choices?.[0]?.message?.content || "AI error";

  }catch(err){
    console.log("AI ERROR:", err.message);
    return "AI error ❌";
  }
}

module.exports = getAIResponse;
