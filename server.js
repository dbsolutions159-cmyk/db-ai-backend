require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const app = express();

// 🔥 ROUTES
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// 🔥 SERVICES
const fetchJobs = require("./services/jobFetcher");

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Health Check (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "DB GPT Backend Running 🚀"
  });
});

// 🔹 Routes
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);

// 🔥 JOB FETCH SYSTEM (NO DB DEPENDENCY REQUIRED)
async function startJobSystem() {
  try {
    console.log("⏳ Fetching initial jobs...");

    await fetchJobs();

    console.log("🔥 Initial jobs fetched");

    // 🔹 Auto fetch every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("⏳ Auto fetching jobs...");
      try {
        await fetchJobs();
      } catch (err) {
        console.log("❌ Cron job error:", err.message);
      }
    });

  } catch (err) {
    console.log("❌ Job system error:", err.message);
  }
}

// 🔥 GLOBAL ERROR HANDLER (IMPORTANT)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// 🔥 SERVER START (Railway Compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // 🔥 Start background job system
  await startJobSystem();
});
