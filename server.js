const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔹 Middleware
app.use(express.json());
app.use(cors());

// 🔹 Routes
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

// 🔹 Test route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("DB Backend Running 🚀");
});

// 🔹 MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log("Mongo Error ❌", err);
  });

// 🔹 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
