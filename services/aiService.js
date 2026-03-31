const UserMemory = require("../models/UserMemory");

async function getAIResponse(userId, message, jobs) {

  const msg = message.toLowerCase();

  // 🔍 memory load
  let memory = await UserMemory.findOne({ userId });

  if (!memory) {
    memory = new UserMemory({ userId });
  }

  // 🔍 extract role
  if (msg.includes("customer") || msg.includes("support")) {
    memory.role = "customer support";
  }

  if (msg.includes("sales")) {
    memory.role = "sales";
  }

  // 🔍 extract location
  if (msg.includes("bhopal")) memory.location = "bhopal";
  if (msg.includes("indore")) memory.location = "indore";

  // 💾 save memory
  await memory.save();

  // 🔥 अगर jobs हैं → show
  if (jobs && jobs.length > 0) {
    let reply = "🔥 Yeh jobs mili hain:\n\n";

    jobs.forEach((job, i) => {
      reply += `${i + 1}. ${job.title}
🏢 ${job.company}
📍 ${job.location}
💰 ${job.salary || "N/A"}\n\n`;
    });

    return reply;
  }

  // 🔥 smart questions (NO repeat)
  if (!memory.role) {
    return "Kaunsa role chahiye? (customer support, sales)";
  }

  if (!memory.location) {
    return "Kaunsi location chahiye? (Bhopal, Indore)";
  }

  return "Searching jobs for you 🔍...";
}

module.exports = getAIResponse;