import { Router } from "express";
import { ChatSession } from "../models.js";

const router = Router();

const MOONSHOT_BASE = process.env.MOONSHOT_BASE_URL || "https://api.moonshot.ai/v1";
const MOONSHOT_KEY = () => process.env.MOONSHOT_API_KEY || "";

const AVAILABLE_MODELS = [
  { id: "kimi-k2.5", name: "Kimi K2.5", ctx: "256k" },
  { id: "moonshot-v1-128k", name: "Moonshot v1 128k", ctx: "128k" },
  { id: "moonshot-v1-32k", name: "Moonshot v1 32k", ctx: "32k" },
  { id: "moonshot-v1-8k", name: "Moonshot v1 8k", ctx: "8k" },
];

// GET /models
router.get("/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// GET /agents — all agents (= chat sessions), lightweight list
router.get("/agents", async (_req, res) => {
  try {
    const sessions = await ChatSession.find({})
      .sort({ pinned: -1, updatedAt: -1 })
      .lean();
    const agents = sessions.map((s) => ({
      _id: s._id,
      name: s.name,
      emoji: s.emoji,
      role: s.role,
      model: s.model,
      systemPrompt: s.systemPrompt,
      pinned: s.pinned,
      messageCount: s.messages?.length || 0,
      lastMessage: s.messages?.length
        ? s.messages[s.messages.length - 1].content.slice(0, 100)
        : "",
      lastRole: s.messages?.length
        ? s.messages[s.messages.length - 1].role
        : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /agents — create new agent
router.post("/agents", async (req, res) => {
  try {
    const { name, emoji, role, model, systemPrompt } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const agent = await ChatSession.create({
      name: name || "New Agent",
      emoji: emoji || "🤖",
      role: role || "Assistant",
      model: model || "kimi-k2.5",
      systemPrompt: systemPrompt || "",
      messages: [],
    });
    res.json({ agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /agents/:id — full agent with messages
router.get("/agents/:id", async (req, res) => {
  try {
    const agent = await ChatSession.findById(req.params.id).lean();
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json({ agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /agents/:id — update agent settings
router.patch("/agents/:id", async (req, res) => {
  try {
    const allowed = ["name", "emoji", "role", "model", "systemPrompt", "pinned"];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }
    const agent = await ChatSession.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json({ agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /agents/:id
router.delete("/agents/:id", async (req, res) => {
  try {
    await ChatSession.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /agents/:id/messages — clear conversation
router.delete("/agents/:id/messages", async (req, res) => {
  try {
    const agent = await ChatSession.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    agent.messages = [];
    await agent.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /agents/:id/send — send message, stream Kimi response
router.post("/agents/:id/send", async (req, res) => {
  try {
    const agent = await ChatSession.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const key = MOONSHOT_KEY();
    if (!key) {
      return res.status(500).json({ error: "MOONSHOT_API_KEY not configured" });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    agent.messages.push({ role: "user", content });
    await agent.save();

    // Build API messages
    const apiMessages = [];
    if (agent.systemPrompt) {
      apiMessages.push({ role: "system", content: agent.systemPrompt });
    }
    for (const m of agent.messages) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    // SSE stream
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const response = await fetch(`${MOONSHOT_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: agent.model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.write(`data: ${JSON.stringify({ type: "error", text: `API error ${response.status}: ${errText}` })}\n\n`);
      res.end();
      return;
    }

    let fullContent = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            res.write(`data: ${JSON.stringify({ type: "token", text: delta.content })}\n\n`);
          }
        } catch {}
      }
    }

    agent.messages.push({ role: "assistant", content: fullContent });
    await agent.save();

    res.write(`data: ${JSON.stringify({ type: "done", fullContent })}\n\n`);
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", text: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
