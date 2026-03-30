import { Router } from "express";
import { AgentStatus } from "../models.js";
import fs from "fs";
import path from "path";

const router = Router();

const DEFAULT_AGENTS = [
  {
    agentId: "kiyo",
    name: "Kiyo",
    emoji: "🦾",
    role: "CEO & Chief Orchestrator",
    status: "idle",
    location: "Command Center",
    currentTask: "Available",
    workspace: "/root/.openclaw/workspace",
  },
  {
    agentId: "arch",
    name: "Arch",
    emoji: "🏗️",
    role: "Senior Developer & System Architect",
    status: "idle",
    location: "Engineering Bay",
    currentTask: "Available",
    workspace: "/root/.openclaw/workspace-leads",
  },
  {
    agentId: "nova",
    name: "Nova",
    emoji: "✨",
    role: "Creative Director & UX Lead",
    status: "idle",
    location: "Design Studio",
    currentTask: "Available",
    workspace: "",
  },
  {
    agentId: "atlas",
    name: "Atlas",
    emoji: "🌐",
    role: "Research Lead & Knowledge Curator",
    status: "idle",
    location: "Knowledge Library",
    currentTask: "Available",
    workspace: "",
  },
  {
    agentId: "echo",
    name: "Echo",
    emoji: "📊",
    role: "Data Analyst & Reporting Specialist",
    status: "idle",
    location: "Analytics Lab",
    currentTask: "Available",
    workspace: "",
  },
];

function getWorkspaceContext(workspacePath) {
  if (!workspacePath) return null;
  try {
    const memoryDir = path.join(workspacePath, "memory");
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let recentMemory = "";
    for (const date of [today, yesterday]) {
      const filePath = path.join(memoryDir, `${date}.md`);
      if (fs.existsSync(filePath)) {
        recentMemory += fs.readFileSync(filePath, "utf8").slice(0, 500);
        break;
      }
    }

    const memoryMd = path.join(workspacePath, "MEMORY.md");
    const longTerm = fs.existsSync(memoryMd)
      ? fs.readFileSync(memoryMd, "utf8").slice(0, 500)
      : "";

    return { recentMemory, longTerm };
  } catch {
    return null;
  }
}

router.get("/", async (_req, res) => {
  try {
    const count = await AgentStatus.countDocuments();
    if (count === 0) {
      await AgentStatus.insertMany(DEFAULT_AGENTS);
    }

    const agents = await AgentStatus.find({}).sort({ agentId: 1 });

    const enriched = agents.map((a) => ({
      ...a.toObject(),
      workspaceContext: getWorkspaceContext(a.workspace),
    }));

    res.json({ success: true, agents: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { agentId, ...updates } = req.body;
    if (!agentId)
      return res.status(400).json({ error: "agentId required" });

    updates.lastSeen = new Date();

    const agent = await AgentStatus.findOneAndUpdate(
      { agentId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, agent });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
