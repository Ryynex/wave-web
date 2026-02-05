const express = require("express");
const cors = require("cors");
// If you want to verify tokens server-side, you would use firebase-admin here
// const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
    // Here you would use admin.auth().verifyIdToken(token)
    // For now, we simulate a success
    console.log("Token received for verification");
    res.json({ status: "success", message: "User verified" });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
});

// Only start the server if this file is run directly (e.g., 'node server.js')
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Always export the app (Vercel imports this to turn it into a serverless function)
module.exports = app;
