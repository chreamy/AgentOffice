import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// ─── Agent definitions — source of truth ────────────────────────────────────
export const AGENTS = [
  { agentId: "main",    name: "Kiyo", emoji: "🦾", role: "CEO & Chief Orchestrator",           workspace: "/root/.openclaw/workspace",        sessionDir: "/root/.openclaw/agents/main/sessions",    location: "Command Center" },
  { agentId: "leads",   name: "Vex",  emoji: "💼", role: "VP of Sales & Business Development", workspace: "/root/.openclaw/workspace-leads",   sessionDir: "/root/.openclaw/agents/leads/sessions",   location: "Sales Floor" },
  { agentId: "it",      name: "Arch", emoji: "🏗️", role: "CTO & Senior Systems Engineer",      workspace: "/root/.openclaw/workspace-it",      sessionDir: "/root/.openclaw/agents/it/sessions",     location: "Engineering Bay" },
  { agentId: "finance", name: "Nova", emoji: "📊", role: "CFO & Operations Lead",               workspace: "/root/.openclaw/workspace-finance", sessionDir: "/root/.openclaw/agents/finance/sessions", location: "Finance Office" },
  { agentId: "growth",  name: "Rex",  emoji: "🚀", role: "Chief Growth Officer",                workspace: "/root/.openclaw/workspace-growth",  sessionDir: "/root/.openclaw/agents/growth/sessions",  location: "Growth Lab" },
];

// ─── Star-Office-UI state constants ──────────────────────────────────────────
const VALID_STATES = new Set(["idle", "writing", "researching", "executing", "syncing", "error"]);
const WORKING_STATES = new Set(["writing", "researching", "executing", "syncing"]);
const STATE_TTL_SECONDS = 300; // auto-idle after 5 min stale

const STATE_ALIASES = {
  working: "writing", busy: "writing", write: "writing",
  run: "executing", running: "executing", execute: "executing", exec: "executing",
  sync: "syncing",
  research: "researching", search: "researching",
};

// Map to our dashboard status names
const STAR_TO_DASH = {
  idle: "idle", writing: "working", researching: "researching",
  executing: "working", syncing: "syncing", error: "error",
};

export function normalizeState(s) {
  const lower = (s || "").toLowerCase().trim();
  if (VALID_STATES.has(lower)) return lower;
  return STATE_ALIASES[lower] || "idle";
}

// ─── File helpers ─────────────────────────────────────────────────────────────
function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return null; }
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, "utf8"); } catch { return null; }
}

// ─── State file path per agent ────────────────────────────────────────────────
function stateFilePath(workspace) {
  return path.join(workspace, "state.json");
}

function overrideFilePath(workspace) {
  return path.join(workspace, "memory", ".agent-office-state.json");
}

// ─── Read agent status (Star-Office-UI pattern) ───────────────────────────────
function readAgentState(agent) {
  const stateFile = stateFilePath(agent.workspace);
  const state = readJSON(stateFile);

  if (state && typeof state.state === "string") {
    let normalized = normalizeState(state.state);
    const detail = state.detail || "";
    const updatedAt = state.updated_at;

    // TTL auto-idle: if working state is stale, revert to idle
    if (WORKING_STATES.has(normalized) && updatedAt) {
      try {
        const age = (Date.now() - new Date(updatedAt).getTime()) / 1000;
        if (age > STATE_TTL_SECONDS) {
          normalized = "idle";
        }
      } catch { /* ignore */ }
    }

    return {
      starState: normalized,
      dashStatus: STAR_TO_DASH[normalized] || "idle",
      currentTask: detail || "Standing by",
      lastUpdated: updatedAt || new Date().toISOString(),
      source: "state.json",
    };
  }

  // Fallback: read override file written by our PATCH endpoint
  const override = readJSON(overrideFilePath(agent.workspace));
  if (override) {
    return {
      starState: normalizeState(override.status || "idle"),
      dashStatus: override.status || "idle",
      currentTask: override.currentTask || "Standing by",
      lastUpdated: override.lastUpdated || new Date().toISOString(),
      source: "override",
    };
  }

  // Last resort: derive from session timestamp
  const sessionState = deriveFromSession(agent.sessionDir);
  return { ...sessionState, source: "session" };
}

function deriveFromSession(sessionDir) {
  try {
    const data = readJSON(path.join(sessionDir, "sessions.json"));
    if (!data) return { starState: "idle", dashStatus: "idle", currentTask: "Standing by", lastUpdated: new Date(0).toISOString() };

    let latest = 0;
    for (const s of Object.values(data)) {
      if (s.updatedAt && s.updatedAt > latest) latest = s.updatedAt;
    }
    if (!latest) return { starState: "idle", dashStatus: "idle", currentTask: "Standing by", lastUpdated: new Date(0).toISOString() };

    const ageSeconds = (Date.now() - latest) / 1000;
    const lastUpdated = new Date(latest).toISOString();

    if (ageSeconds < 180)  return { starState: "writing",     dashStatus: "working",      currentTask: "Active session", lastUpdated };
    if (ageSeconds < 600)  return { starState: "researching", dashStatus: "researching",  currentTask: "Recent activity", lastUpdated };
    return                        { starState: "idle",         dashStatus: "idle",          currentTask: "Standing by",    lastUpdated };
  } catch {
    return { starState: "idle", dashStatus: "idle", currentTask: "Standing by", lastUpdated: new Date(0).toISOString() };
  }
}

// ─── Read yesterday-memo (Star-Office-UI pattern) ─────────────────────────────
function getYesterdayMemo(workspace) {
  const memDir = path.join(workspace, "memory");
  if (!fs.existsSync(memDir)) return null;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const files = fs.readdirSync(memDir)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse()
    .filter(f => f.replace(".md", "") !== today); // skip today

  if (!files.length) return null;
  const target = files[0];
  const content = readFile(path.join(memDir, target));
  if (!content) return null;

  // Sanitize: strip headers, get first 300 chars of meaningful content
  const lines = content.split("\n")
    .filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith("==="))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    date: target.replace(".md", ""),
    memo: lines.slice(0, 300) + (lines.length > 300 ? "…" : ""),
  };
}

// ─── Read heartbeat task ──────────────────────────────────────────────────────
function getHeartbeatTask(workspace) {
  const content = readFile(path.join(workspace, "HEARTBEAT.md"));
  if (!content) return null;
  const line = content.split("\n").find(l => /^[-*]\s/.test(l));
  return line ? line.replace(/^[-*]\s*/, "").slice(0, 120) : null;
}

// ─── Build full agent object ──────────────────────────────────────────────────
export function buildAgent(agent) {
  const state = readAgentState(agent);
  const heartbeat = getHeartbeatTask(agent.workspace);
  const memo = getYesterdayMemo(agent.workspace);
  const identity = readFile(path.join(agent.workspace, "IDENTITY.md")) || "";

  // Extract real name/emoji/role from IDENTITY.md if different
  const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
  const emojiMatch = identity.match(/\*\*Emoji:\*\*\s*(.+)/);
  const roleMatch = identity.match(/\*\*Role:\*\*\s*(.+)/);

  return {
    agentId: agent.agentId,
    name: nameMatch?.[1]?.trim() || agent.name,
    emoji: emojiMatch?.[1]?.trim() || agent.emoji,
    role: roleMatch?.[1]?.trim() || agent.role,
    status: state.dashStatus,
    starState: state.starState,
    location: agent.location,
    currentTask: state.currentTask !== "Standing by" && state.currentTask !== "Active session"
      ? state.currentTask
      : (heartbeat || state.currentTask),
    lastSeen: state.lastUpdated,
    stateSource: state.source,
    yesterdayMemo: memo,
    uptime: "99.9%",
    tasksCompleted: 0,
    responseTime: "~2s",
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  try {
    const agents = AGENTS.map(buildAgent);
    res.json({ success: true, agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Star-Office-UI compatible: POST /set_state (for SOUL.md integration)
router.post("/set_state", (req, res) => {
  try {
    const { agentId, state, detail } = req.body;
    if (!agentId) return res.status(400).json({ ok: false, msg: "agentId required" });

    const agent = AGENTS.find(a => a.agentId === agentId);
    if (!agent) return res.status(404).json({ ok: false, msg: "Agent not found" });

    const normalized = normalizeState(state || "idle");
    const stateData = {
      state: normalized,
      detail: detail || "",
      updated_at: new Date().toISOString(),
      ttl_seconds: STATE_TTL_SECONDS,
    };

    writeJSON(stateFilePath(agent.workspace), stateData);
    res.json({ ok: true, agentId, state: normalized, area: normalized === "error" ? "error" : normalized === "idle" ? "breakroom" : "writing" });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PATCH for dashboard UI updates
router.patch("/", (req, res) => {
  try {
    const { agentId, status, currentTask, location } = req.body;
    if (!agentId) return res.status(400).json({ error: "agentId required" });

    const agent = AGENTS.find(a => a.agentId === agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // Write both state.json (star pattern) and override file
    if (status) {
      const starState = normalizeState(status);
      writeJSON(stateFilePath(agent.workspace), {
        state: starState,
        detail: currentTask || "",
        updated_at: new Date().toISOString(),
        ttl_seconds: STATE_TTL_SECONDS,
      });
    }

    // Also update override for dashboard-specific fields
    const overridePath = overrideFilePath(agent.workspace);
    const existing = readJSON(overridePath) || {};
    writeJSON(overridePath, {
      ...existing,
      ...(status && { status }),
      ...(currentTask && { currentTask }),
      ...(location && { location }),
      lastUpdated: new Date().toISOString(),
    });

    res.json({ success: true, agentId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
