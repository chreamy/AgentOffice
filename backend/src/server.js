import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import chatRouter from "./routes/chat.js";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

async function start() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.log("Server starting without DB — will retry on requests");
  }

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start();
