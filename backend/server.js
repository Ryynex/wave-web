require("dotenv").config(); // Load .env file
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Configure CORS dynamic origin
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.send("Wave Backend is running");
});

// Example protected route for logic handling
app.post("/api/auth/verify", async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // In production: await admin.auth().verifyIdToken(token)
    console.log("Token received for verification");
    res.json({ status: "success", message: "User verified" });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
});

// Vercel Serverless Support
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Accepting requests from: ${CLIENT_URL}`);
  });
}

module.exports = app;
