import express from "express";
import fs from "fs";
import path from "path";
import { AGENTS, getAgentsFromWorkspace } from "../agents.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const agents = getAgentsFromWorkspace();
    res.json({ success: true, agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { agentId, status, currentTask, location } = req.body;
    if (!agentId) return res.status(400).json({ error: "agentId required" });

    const agent = AGENTS.find(a => a.agentId === agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const stateFile = path.join(agent.workspace, "memory", ".agent-office-state.json");
    let state = {};
    try { state = JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch {}

    if (status) state.status = status;
    if (currentTask) state.currentTask = currentTask;
    if (location) state.location = location;
    state.lastUpdated = new Date().toISOString();

    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    res.json({ success: true, agentId, state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
