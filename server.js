require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 🔹 Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// 🔹 Safe require (crash avoid)
let fetchJobs;
try {
  fetchJobs = require("./services/jobFetcher");
} catch (err) {
  console.log("❌ jobFetcher not found:", err.message);
}

// 🔹 Routes
let chatRoutes, authRoutes;

try {
  chatRoutes = require("./routes/chatRoutes");
  app.use("/api", chatRoutes);
} catch (err) {
  console.log("❌ chatRoutes error:", err.message);
}

try {
  authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
} catch (err) {
  console.log("❌ authRoutes error:", err.message);
}

// 🔹 Root route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // 🔥 Only run if exists
    if (fetchJobs) {
      console.log("🚀 Running job fetch...");
      fetchJobs();
    }
  })
  .catch(err => console.log("❌ Mongo Error:", err.message));

// 🔹 CRON JOB (safe)
try {
  const cron = require("node-cron");

  cron.schedule("0 */6 * * *", () => {
    console.log("⏳ Cron: Fetching jobs...");
    if (fetchJobs) fetchJobs();
  });

} catch (err) {
  console.log("❌ Cron not working:", err.message);
}

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
