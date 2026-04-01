const fetch = require("node-fetch");

async function getAIResponse(userId, message){

  try{

    console.log("AI Request:", message);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are a smart professional career assistant. Give clear, helpful answers."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await res.json();

    // 🔥 DEBUG
    console.log("AI RAW:", data);

    if(!data || !data.choices){
      return "AI not responding properly ❌";
    }

    return data.choices[0].message.content;

  }catch(err){
    console.log("AI ERROR FULL:", err.message);
    return "AI error ❌";
  }
}

module.exports = getAIResponse;
