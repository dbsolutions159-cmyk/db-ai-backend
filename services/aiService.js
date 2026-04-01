const fetch = require("node-fetch");

async function getAIResponse(userId, message){

  try{

    // ✅ API KEY CHECK
    if(!process.env.GROQ_API_KEY){
      console.log("❌ API KEY MISSING");
      return "API key missing ❌";
    }

    // 🚀 API CALL
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // ✅ stable model
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
- Career advice

STYLE:
- Talk like a human (Hindi + English mix)
- Keep answers short (2–4 lines)
- Ask only ONE question at a time
- Don't repeat questions
- Be smart, not robotic

IMPORTANT:
- Never say "You said"
- Always move conversation forward
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    // 🧠 RESPONSE PARSE
    const data = await res.json();

    // 🔍 DEBUG LOGS (VERY IMPORTANT)
    console.log("STATUS:", res.status);
    console.log("AI RESPONSE:", JSON.stringify(data, null, 2));

    // ✅ SUCCESS RESPONSE
    if(data?.choices?.[0]?.message?.content){
      return data.choices[0].message.content.trim();
    }

    // ❌ अगर API response गलत आया
    if(data?.error){
      return `AI Error: ${data.error.message}`;
    }

    return "AI response issue ❌";

  }catch(err){
    console.log("🔥 AI ERROR:", err);
    return "AI error ❌";
  }
}

module.exports = getAIResponse;
