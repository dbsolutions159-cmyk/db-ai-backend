require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

// 🔥 IMPORT JOB FETCHER
const fetchJobs = require("./services/jobFetcher");

// 🔹 Routes
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Routes use
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 MongoDB Connect + FIRST RUN
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");

    // 🔥 FIRST TIME JOB FETCH
  setTimeout(async () => {
  try {
    await fetchJobs();
    console.log("🔥 Initial jobs fetched");
  } catch (err) {
    console.log("❌ Job fetch error:", err.message);
  }
}, 5000);

// 🔹 AUTO JOB FETCH (हर 6 घंटे)
cron.schedule("0 */6 * * *", async () => {
  console.log("⏳ Auto fetching jobs...");
  await fetchJobs();
});

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
