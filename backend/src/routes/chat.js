import { Router } from "express";
import { ChatSession } from "../models.js";

const router = Router();

const KIMI_BASE = process.env.KIMI_BASE_URL || "https://api.moonshot.ai/v1";
const KIMI_KEY = process.env.KIMI_API_KEY || "";

const AVAILABLE_MODELS = [
  { id: "kimi-k2.5", name: "Kimi K2.5", ctx: "256k" },
  { id: "moonshot-v1-128k", name: "Moonshot v1 128k", ctx: "128k" },
  { id: "moonshot-v1-32k", name: "Moonshot v1 32k", ctx: "32k" },
  { id: "moonshot-v1-8k", name: "Moonshot v1 8k", ctx: "8k" },
];

// GET /api/chat/models — list available models
router.get("/models", (_req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// GET /api/chat/sessions — list all sessions
router.get("/sessions", async (_req, res) => {
  try {
    const sessions = await ChatSession.find({})
      .sort({ pinned: -1, updatedAt: -1 })
      .select("title agentId agentName agentEmoji model pinned createdAt updatedAt messages")
      .lean();
    // Include message count but don't send full messages in list
    const list = sessions.map((s) => ({
      ...s,
      messageCount: s.messages?.length || 0,
      lastMessage: s.messages?.length
        ? s.messages[s.messages.length - 1].content.slice(0, 80)
        : "",
      messages: undefined,
    }));
    res.json({ sessions: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/sessions — create new session
router.post("/sessions", async (req, res) => {
  try {
    const { title, agentId, agentName, agentEmoji, model, systemPrompt } = req.body;
    const session = await ChatSession.create({
      title: title || "New Chat",
      agentId: agentId || "",
      agentName: agentName || "",
      agentEmoji: agentEmoji || "",
      model: model || "kimi-k2.5",
      systemPrompt: systemPrompt || "",
      messages: [],
    });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/sessions/:id — get session with full messages
router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/chat/sessions/:id — update session metadata
router.patch("/sessions/:id", async (req, res) => {
  try {
    const { title, model, systemPrompt, pinned } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (model !== undefined) update.model = model;
    if (systemPrompt !== undefined) update.systemPrompt = systemPrompt;
    if (pinned !== undefined) update.pinned = pinned;
    const session = await ChatSession.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/sessions/:id
router.delete("/sessions/:id", async (req, res) => {
  try {
    await ChatSession.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/sessions/:id/send — send message and stream Kimi response
router.post("/sessions/:id/send", async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (!KIMI_KEY) {
      return res.status(500).json({ error: "KIMI_API_KEY not configured. Set it in .env" });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    // Add user message
    session.messages.push({ role: "user", content });

    // Auto-title on first message
    if (session.messages.length === 1 && session.title === "New Chat") {
      session.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    }

    await session.save();

    // Build messages for Kimi
    const apiMessages = [];
    if (session.systemPrompt) {
      apiMessages.push({ role: "system", content: session.systemPrompt });
    }
    for (const m of session.messages) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    // Stream response via SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const response = await fetch(`${KIMI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_KEY}`,
      },
      body: JSON.stringify({
        model: session.model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.write(`data: ${JSON.stringify({ type: "error", text: `Kimi API error ${response.status}: ${errText}` })}\n\n`);
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
        } catch {
          // skip unparseable chunks
        }
      }
    }

    // Save assistant message
    session.messages.push({ role: "assistant", content: fullContent });
    await session.save();

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
