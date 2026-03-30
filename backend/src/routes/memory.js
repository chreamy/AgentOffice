import { Router } from "express";
import { Memory } from "../models.js";
import fs from "fs";
import path from "path";

const router = Router();

const WORKSPACES = {
  kiyo: "/root/.openclaw/workspace",
  arch: "/root/.openclaw/workspace-leads",
};

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

router.get("/", async (req, res) => {
  try {
    const { agentId, longTermOnly } = req.query;

    await syncMemoryFiles();

    const filter = {};
    if (agentId) filter.agentId = agentId;
    if (longTermOnly === "true") filter.isLongTerm = true;

    const memories = await Memory.find(filter).sort({ date: -1 }).limit(20);
    res.json({ success: true, memories });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
