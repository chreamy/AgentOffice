import { Router } from "express";
import { AGENTS, buildAgent } from "./agents.js";
import { Task } from "../models.js";
import { Activity } from "../models.js";
import { Message } from "../models.js";

const router = Router();

router.get("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  let closed = false;

  const send = (event, data) => {
    if (closed) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("connected", { ts: Date.now() });

  const poll = async () => {
    if (closed) return;
    try {
      // Agents: read directly from OpenClaw workspace files (Star-Office-UI pattern)
      const agents = AGENTS.map(buildAgent);

      // Tasks, activities, messages from MongoDB
      let tasks = [], activities = [], messages = [];
      try {
        [tasks, activities, messages] = await Promise.all([
          Task.find({}).sort({ createdAt: -1 }).limit(100).lean(),
          Activity.find({}).sort({ createdAt: -1 }).limit(50).lean(),
          Message.find({ channel: "general" }).sort({ createdAt: 1 }).limit(50).lean(),
        ]);
      } catch { /* DB may not be connected yet — serve agents anyway */ }

      const agentsOnline = agents.filter(a => a.status !== "idle").length;

      send("agents", agents);
      send("tasks", tasks);
      send("activities", activities);
      send("messages", messages);
      send("stats", {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "done").length,
        inProgressTasks: tasks.filter(t => t.status === "in-progress").length,
        agentsOnline,
        totalAgents: agents.length,
      });
    } catch (err) {
      send("error", { message: String(err) });
    }
  };

  poll();
  const interval = setInterval(poll, 3000);

  req.on("close", () => {
    closed = true;
    clearInterval(interval);
  });
});

export default router;
