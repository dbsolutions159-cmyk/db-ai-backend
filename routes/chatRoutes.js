const express = require("express");
const router = express.Router();

// 🔹 TEST CHAT ROUTE
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Basic validation
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // Dummy response (for testing)
    res.json({
      reply: `You said: ${message}`,
      status: "working"
    });

  } catch (error) {
    console.log("Chat Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
