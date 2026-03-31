import express from "express";
import { Task, Activity } from "../models.js";
import { AGENTS } from "./agents.js";

const router = express.Router();

// Helper — log an activity event when task status changes
async function logActivity(agent, task, eventType) {
  const messages = {
    "in-progress": `started working on: ${task.title}`,
    done: `completed: ${task.title}`,
    queued: `queued task: ${task.title}`,
  };
  try {
    await Activity.create({
      type: eventType === "done" ? "success" : "info",
      agentId: agent?.agentId || task.agentId || "system",
      agentName: agent?.name || task.agentName || "System",
      agentEmoji: agent?.emoji || task.agentEmoji || "🤖",
      message: messages[eventType] || `updated task: ${task.title}`,
      metadata: task.priority,
      taskId: String(task._id),
    });
  } catch { /* non-critical */ }
}

// GET /api/tasks — list all, optionally filter by status or agentId
router.get("/", async (req, res) => {
  try {
    const { status, agentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (agentId) filter.agentId = agentId;
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks — create a task (queued by default)
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate, agentName, agentId } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const agent = AGENTS.find(a => a.agentId === agentId);
    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "P2",
      dueDate: dueDate || "",
      status: "queued",
      agentName: agentName || agent?.name || "",
      agentId: agentId || "",
      agentEmoji: agent?.emoji || "",
      queuedAt: new Date(),
    });

    await logActivity(agent, task, "queued");
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/start — agent claims + starts a task
router.post("/:id/start", async (req, res) => {
  try {
    const { agentId, agentName } = req.body;
    if (!agentId) return res.status(400).json({ error: "agentId required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.status === "in-progress") {
      return res.status(409).json({ error: `Already in progress by ${task.agentName}` });
    }
    if (task.status === "done") {
      return res.status(409).json({ error: "Task already done" });
    }

    const agent = AGENTS.find(a => a.agentId === agentId);
    task.status = "in-progress";
    task.agentId = agentId;
    task.agentName = agentName || agent?.name || agentId;
    task.agentEmoji = agent?.emoji || "";
    task.startedAt = new Date();
    await task.save();

    // Also write state.json for the agent workspace
    try {
      import("fs").then(fs => {
        const stateFile = `${agent?.workspace || ""}/state.json`;
        if (agent?.workspace) {
          fs.writeFileSync(stateFile, JSON.stringify({
            state: "executing",
            detail: task.title,
            updated_at: new Date().toISOString(),
            ttl_seconds: 300,
          }, null, 2));
        }
      });
    } catch { /* non-critical */ }

    await logActivity(agent, task, "in-progress");
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/done — agent marks task complete
router.post("/:id/done", async (req, res) => {
  try {
    const { agentId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const agent = AGENTS.find(a => a.agentId === (agentId || task.agentId));
    task.status = "done";
    task.completedAt = new Date();
    await task.save();

    // Reset agent state to idle
    try {
      import("fs").then(fs => {
        if (agent?.workspace) {
          fs.writeFileSync(`${agent.workspace}/state.json`, JSON.stringify({
            state: "idle",
            detail: `Completed: ${task.title}`,
            updated_at: new Date().toISOString(),
            ttl_seconds: 300,
          }, null, 2));
        }
      });
    } catch { /* non-critical */ }

    await logActivity(agent, task, "done");
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/tasks/:id — general update (title, description, priority, etc.)
router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["title", "description", "priority", "dueDate", "status", "agentName", "agentId"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
