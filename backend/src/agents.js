import fs from "fs";
import path from "path";

export const AGENTS = [
  { agentId: "main",    name: "Kiyo", emoji: "🦾", role: "CEO & Chief Orchestrator",              workspace: "/root/.openclaw/workspace",         sessionDir: "/root/.openclaw/agents/main/sessions" },
  { agentId: "leads",   name: "Vex",  emoji: "💼", role: "VP of Sales & Business Development",    workspace: "/root/.openclaw/workspace-leads",    sessionDir: "/root/.openclaw/agents/leads/sessions" },
  { agentId: "it",      name: "Arch", emoji: "🏗️", role: "CTO & Senior Systems Engineer",         workspace: "/root/.openclaw/workspace-it",       sessionDir: "/root/.openclaw/agents/it/sessions" },
  { agentId: "finance", name: "Nova", emoji: "📊", role: "CFO & Operations Lead",                 workspace: "/root/.openclaw/workspace-finance",  sessionDir: "/root/.openclaw/agents/finance/sessions" },
  { agentId: "growth",  name: "Rex",  emoji: "🚀", role: "Chief Growth Officer",                  workspace: "/root/.openclaw/workspace-growth",   sessionDir: "/root/.openclaw/agents/growth/sessions" },
];

const LOCATION_MAP = {
  main: "Command Center",
  leads: "Sales Floor",
  it: "Engineering Bay",
  finance: "Finance Office",
  growth: "Growth Lab",
};

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
  if (secondsAgo < 180) return "working";
  if (secondsAgo < 600) return "researching";
  return "idle";
}

export function getAgentsFromWorkspace() {
  return AGENTS.map(agent => {
    const lastSeen = getLastSessionActivity(agent.sessionDir);
    const status = deriveStatus(agent.agentId, lastSeen);
    const lastMemory = getLastMemory(agent.workspace);
    const heartbeat = getHeartbeatState(agent.workspace);
    const heartbeatMd = readFileSafe(path.join(agent.workspace, "HEARTBEAT.md"));
    const currentTask = heartbeatMd
      ? heartbeatMd.split("\n").find(l => l.startsWith("- ") || l.startsWith("* "))?.replace(/^[-*]\s*/, "").slice(0, 100) || "Standing by"
      : "Standing by";

    return {
      _id: agent.agentId,
      agentId: agent.agentId,
      name: agent.name,
      emoji: agent.emoji,
      role: agent.role,
      status,
      lastSeen: lastSeen || new Date(0).toISOString(),
      currentTask,
      location: LOCATION_MAP[agent.agentId] || "Office",
      workspace: agent.workspace,
      lastMemoryNote: lastMemory,
      hasHeartbeat: !!heartbeatMd,
      heartbeatLastCheck: heartbeat?.lastChecks || null,
      uptime: "99.9%",
      tasksCompleted: 0,
      responseTime: "~2s",
      statusMessage: "",
    };
  });
}
