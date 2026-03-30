import { Router } from "express";
import { AgentStatus, Task, Activity, Message } from "../models.js";

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
      const [agents, tasks, activities, messages] = await Promise.all([
        AgentStatus.find({}).sort({ agentId: 1 }).lean(),
        Task.find({}).sort({ createdAt: -1 }).limit(100).lean(),
        Activity.find({}).sort({ createdAt: -1 }).limit(50).lean(),
        Message.find({ channel: "general" })
          .sort({ createdAt: 1 })
          .limit(50)
          .lean(),
      ]);

      const agentsOnline = agents.filter(
        (a) =>
          a.status !== "idle" ||
          Date.now() - new Date(a.lastSeen).getTime() < 300000
      ).length;

      send("agents", agents);
      send("tasks", tasks);
      send("activities", activities);
      send("messages", messages);
      send("stats", {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "done").length,
        inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
        agentsOnline,
        totalAgents: agents.length,
      });
    } catch (err) {
      send("error", { message: String(err) });
    }
  };

  // Initial burst
  poll();

  // Then every 2s
  const interval = setInterval(poll, 2000);

  req.on("close", () => {
    closed = true;
    clearInterval(interval);
  });
});

export default router;
