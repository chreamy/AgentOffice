import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Memory } from "@/lib/models";
import fs from "fs";
import path from "path";

const WORKSPACES: Record<string, string> = {
  kiyo: "/root/.openclaw/workspace",
  arch: "/root/.openclaw/workspace-leads",
};

// Sync memory files from disk into MongoDB
async function syncMemoryFiles() {
  for (const [agentId, workspacePath] of Object.entries(WORKSPACES)) {
    const memoryDir = path.join(workspacePath, "memory");
    if (!fs.existsSync(memoryDir)) continue;

    const files = fs.readdirSync(memoryDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const date = file.replace(".md", "");
      const content = fs.readFileSync(path.join(memoryDir, file), "utf8");

      await Memory.findOneAndUpdate(
        { agentId, date },
        { $set: { agentId, date, content, isLongTerm: false } },
        { upsert: true }
      );
    }

    // Also sync MEMORY.md as long-term
    const memoryMd = path.join(workspacePath, "MEMORY.md");
    if (fs.existsSync(memoryMd)) {
      const content = fs.readFileSync(memoryMd, "utf8");
      await Memory.findOneAndUpdate(
        { agentId, date: "long-term" },
        { $set: { agentId, date: "long-term", content, isLongTerm: true } },
        { upsert: true }
      );
    }
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const longTermOnly = searchParams.get("longTermOnly") === "true";

    // Sync from disk first
    await syncMemoryFiles();

    const filter: Record<string, unknown> = {};
    if (agentId) filter.agentId = agentId;
    if (longTermOnly) filter.isLongTerm = true;

    const memories = await Memory.find(filter).sort({ date: -1 }).limit(20);
    return NextResponse.json({ success: true, memories });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
