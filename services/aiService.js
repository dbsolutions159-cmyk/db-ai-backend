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
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `
You are DB GPT — AI Career Assistant.

You help with:
- Jobs
- Interview preparation
- Mock interviews
- Resume building
- Career guidance

STYLE:
- Talk like a human (friendly Hindi + English mix)
- Keep answers short (2–4 lines max)
- Ask only ONE question at a time
- Never repeat same question
- Always move conversation forward

BEHAVIOR:
- If user is confused → guide step by step
- If user asks random question → answer normally
- If user is in flow → continue flow

IMPORTANT:
- Never say "You said"
- Never repeat sentences
- Be smart, not robotic
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

    // 🔥 SAFE RESPONSE
    if(data?.choices?.[0]?.message?.content){
      return data.choices[0].message.content;
    }

    console.log("AI RAW ERROR:", data);
    return "AI thoda busy hai, try again 👍";

  }catch(err){
    console.log("AI ERROR:", err);
    return "AI error ❌";
  }
}

module.exports = getAIResponse;
