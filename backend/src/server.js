import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import agentsRouter from "./routes/agents.js";
import tasksRouter from "./routes/tasks.js";
import activityRouter from "./routes/activity.js";
import messagesRouter from "./routes/messages.js";
import analyticsRouter from "./routes/analytics.js";
import memoryRouter from "./routes/memory.js";
import streamRouter from "./routes/stream.js";
import chatRouter from "./routes/chat.js";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/agents", agentsRouter);
app.use("/api/tasks", tasksRouter);
// Alias for agent scripts: POST /api/tasks/:id/start and /done are handled inside tasksRouter
app.use("/api/activity", activityRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/stream", streamRouter);
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
