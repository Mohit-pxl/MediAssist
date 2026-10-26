const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Security-related HTTP headers
app.use(helmet());

// Allow frontend requests during development
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

//Authentication routes
app.use("/api/v1/auth",authRoutes);

// Health-check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediAssist API is running",
  });
});

module.exports = app;