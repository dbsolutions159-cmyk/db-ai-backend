require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 🔹 Middleware
app.use(express.json());
app.use(cors());

// 🔹 Routes
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);

// 🔹 Root Test Route
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log("Mongo Error ❌", err.message);
  });

// 🔹 Global Error Handler (safe)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Something went wrong ❌" });
});

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
