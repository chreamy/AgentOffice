import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const AGENTS = [
  { agentId: "main",    name: "Kiyo", emoji: "🦾", role: "CEO & Chief Orchestrator",        workspace: "/root/.openclaw/workspace",         sessionDir: "/root/.openclaw/agents/main/sessions" },
  { agentId: "leads",   name: "Vex",  emoji: "💼", role: "VP of Sales & Business Development", workspace: "/root/.openclaw/workspace-leads",    sessionDir: "/root/.openclaw/agents/leads/sessions" },
  { agentId: "it",      name: "Arch", emoji: "🏗️", role: "CTO & Senior Systems Engineer",   workspace: "/root/.openclaw/workspace-it",       sessionDir: "/root/.openclaw/agents/it/sessions" },
  { agentId: "finance", name: "Nova", emoji: "📊", role: "CFO & Operations Lead",            workspace: "/root/.openclaw/workspace-finance",  sessionDir: "/root/.openclaw/agents/finance/sessions" },
  { agentId: "growth",  name: "Rex",  emoji: "🚀", role: "Chief Growth Officer",             workspace: "/root/.openclaw/workspace-growth",   sessionDir: "/root/.openclaw/agents/growth/sessions" },
];

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, "utf8"); } catch { return null; }
}

function getLastSessionActivity(sessionDir) {
  try {
    const sessionsJson = path.join(sessionDir, "sessions.json");
    const data = JSON.parse(fs.readFileSync(sessionsJson, "utf8"));
    let latest = 0;
    for (const session of Object.values(data)) {
      if (session.updatedAt && session.updatedAt > latest) latest = session.updatedAt;
    }
    return latest ? new Date(latest).toISOString() : null;
  } catch { return null; }
}

function getLastMemory(workspace) {
  try {
    const memDir = path.join(workspace, "memory");
    if (!fs.existsSync(memDir)) return null;
    const files = fs.readdirSync(memDir)
      .filter(f => f.endsWith(".md") && /^\d{4}-\d{2}-\d{2}/.test(f))
      .sort().reverse();
    if (!files.length) return null;
    const content = fs.readFileSync(path.join(memDir, files[0]), "utf8");
    // Extract first meaningful line after headers
    const lines = content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
    return lines[0]?.slice(0, 120) || null;
  } catch { return null; }
}

function getHeartbeatState(workspace) {
  try {
    const f = path.join(workspace, "memory", "heartbeat-state.json");
    return JSON.parse(fs.readFileSync(f, "utf8"));
  } catch { return null; }
}

function deriveStatus(agentId, lastSeen) {
  if (!lastSeen) return "idle";
  const secondsAgo = (Date.now() - new Date(lastSeen).getTime()) / 1000;
  // Active in last 3 minutes = working
  if (secondsAgo < 180) return "working";
  // Active in last 10 minutes = researching
  if (secondsAgo < 600) return "researching";
  // Active in last hour = idle but recent
  return "idle";
}

function getIdentityField(workspace, field) {
  const content = readFileSafe(path.join(workspace, "IDENTITY.md"));
  if (!content) return null;
  const match = content.match(new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : null;
}

router.get("/", async (_req, res) => {
  try {
    const agents = AGENTS.map(agent => {
      const lastSeen = getLastSessionActivity(agent.sessionDir);
      const status = deriveStatus(agent.agentId, lastSeen);
      const lastMemory = getLastMemory(agent.workspace);
      const heartbeat = getHeartbeatState(agent.workspace);

      // Read SOUL.md for current task hint
      const soul = readFileSafe(path.join(agent.workspace, "SOUL.md"));
      const memory = readFileSafe(path.join(agent.workspace, "MEMORY.md"));

      // Check for active HEARTBEAT.md tasks
      const heartbeatMd = readFileSafe(path.join(agent.workspace, "HEARTBEAT.md"));
      const currentTask = heartbeatMd
        ? heartbeatMd.split("\n").find(l => l.startsWith("- ") || l.startsWith("* "))?.replace(/^[-*]\s*/, "").slice(0, 100) || "Standing by"
        : "Standing by";

      return {
        agentId: agent.agentId,
        name: agent.name,
        emoji: agent.emoji,
        role: agent.role,
        status,
        lastSeen: lastSeen || new Date(0).toISOString(),
        currentTask,
        location: {
          main: "Command Center",
          leads: "Sales Floor",
          it: "Engineering Bay",
          finance: "Finance Office",
          growth: "Growth Lab",
        }[agent.agentId] || "Office",
        workspace: agent.workspace,
        lastMemoryNote: lastMemory,
        hasHeartbeat: !!heartbeatMd,
        heartbeatLastCheck: heartbeat?.lastChecks || null,
        uptime: "99.9%",
        tasksCompleted: 0,
        responseTime: "~2s",
      };
    });

    res.json({ success: true, agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { agentId, status, currentTask, location } = req.body;
    if (!agentId) return res.status(400).json({ error: "agentId required" });

    // Write status to a lightweight state file per agent
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
