export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AgentStatus } from "@/lib/models";
import fs from "fs";
import path from "path";

// Seed agents if they don't exist
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

function getWorkspaceContext(workspacePath: string) {
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
    
    // Check MEMORY.md for long-term
    const memoryMd = path.join(workspacePath, "MEMORY.md");
    const longTerm = fs.existsSync(memoryMd)
      ? fs.readFileSync(memoryMd, "utf8").slice(0, 500)
      : "";

    return { recentMemory, longTerm };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Seed if empty
    const count = await AgentStatus.countDocuments();
    if (count === 0) {
      await AgentStatus.insertMany(DEFAULT_AGENTS);
    }
    
    const agents = await AgentStatus.find({}).sort({ agentId: 1 });
    
    // Enrich with workspace context
    const enriched = agents.map((a) => {
      const ctx = getWorkspaceContext(a.workspace);
      return {
        ...a.toObject(),
        workspaceContext: ctx,
      };
    });
    
    return NextResponse.json({ success: true, agents: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { agentId, ...updates } = body;
    
    if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });
    
    updates.lastSeen = new Date();
    
    const agent = await AgentStatus.findOneAndUpdate(
      { agentId },
      { $set: updates },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, agent });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
