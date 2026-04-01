require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ MISSING था (CRASH का reason)
const cron = require("node-cron");

// 🔥 IMPORT JOB FETCHER
const fetchJobs = require("./services/jobFetcher");

// 🔹 Routes
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Routes use
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 MongoDB Connect + SERVER START
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    // 🔥 FIRST TIME JOB FETCH (safe delay)
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
      try {
        await fetchJobs();
      } catch (err) {
        console.log("❌ Cron job error:", err.message);
      }
    });

    // 🔹 Start Server (DB connect के बाद)
    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });

  })
  .catch(err => {
    console.log("❌ MongoDB Connection Error:", err.message);
  });
