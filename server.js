const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const cron = require("node-cron");
const fetchJobs = require("./services/jobFetcher");
const app = express();

// 🔹 Middleware
app.use(express.json());
app.use(cors());

app.use(express.static("public"));

// 🔹 Routes
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 CRON JOB (Auto हर 6 घंटे)
cron.schedule("0 */6 * * *", () => {
  console.log("⏳ Fetching jobs...");
  fetchJobs();
});

// 🔹 MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    // 🔥 FIRST TIME RUN (VERY IMPORTANT)
    fetchJobs();
  })
  .catch(err => console.log("Mongo Error ❌", err));

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});