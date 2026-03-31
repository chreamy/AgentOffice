import { Router } from "express";
import { Agent, Conversation, Provider } from "../models.js";

const router = Router();

// ─── Default providers (seeded on first request) ────────────────────────────

const DEFAULT_PROVIDERS = [
  {
    name: "moonshot",
    label: "Moonshot AI",
    baseUrl: "https://api.moonshot.ai/v1",
    apiKey: "",
    models: [
      { id: "kimi-k2.5", name: "Kimi K2.5", ctx: "256k" },
      { id: "moonshot-v1-128k", name: "Moonshot v1 128k", ctx: "128k" },
      { id: "moonshot-v1-32k", name: "Moonshot v1 32k", ctx: "32k" },
      { id: "moonshot-v1-8k", name: "Moonshot v1 8k", ctx: "8k" },
    ],
  },
  {
    name: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    models: [
      { id: "gpt-4o", name: "GPT-4o", ctx: "128k" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", ctx: "128k" },
      { id: "o3-mini", name: "o3-mini", ctx: "200k" },
    ],
  },
  {
    name: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", ctx: "64k" },
      { id: "deepseek-reasoner", name: "DeepSeek R1", ctx: "64k" },
    ],
  },
  {
    name: "ollama",
    label: "Ollama (Local)",
    baseUrl: "http://localhost:11434/v1",
    apiKey: "ollama",
    models: [
      { id: "llama3.1", name: "Llama 3.1", ctx: "128k" },
      { id: "qwen2.5", name: "Qwen 2.5", ctx: "32k" },
      { id: "deepseek-r1:8b", name: "DeepSeek R1 8B", ctx: "32k" },
    ],
  },
  {
    name: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey: "",
    models: [
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", ctx: "200k" },
      { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro", ctx: "1M" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", ctx: "1M" },
    ],
  },
];

async function seedProviders() {
  for (const p of DEFAULT_PROVIDERS) {
    const exists = await Provider.findOne({ name: p.name });
    if (!exists) {
      // Check env for API keys
      const envKeys = {
        moonshot: process.env.MOONSHOT_API_KEY,
        openai: process.env.OPENAI_API_KEY,
        deepseek: process.env.DEEPSEEK_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
      };
      await Provider.create({ ...p, apiKey: envKeys[p.name] || p.apiKey });
    }
  }
}

let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  try { await seedProviders(); seeded = true; } catch {}
}

// ─── Cost estimation (rough per-1M-token pricing) ───────────────────────────
const COST_PER_M = {
  "kimi-k2.5": { in: 0.55, out: 2.19 },
  "moonshot-v1-128k": { in: 0.78, out: 1.56 },
  "moonshot-v1-32k": { in: 0.17, out: 0.34 },
  "moonshot-v1-8k": { in: 0.08, out: 0.17 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "o3-mini": { in: 1.1, out: 4.4 },
  "deepseek-chat": { in: 0.27, out: 1.1 },
  "deepseek-reasoner": { in: 0.55, out: 2.19 },
};

function estimateCost(model, tokensIn, tokensOut) {
  const rate = COST_PER_M[model] || { in: 1, out: 3 };
  return (tokensIn * rate.in + tokensOut * rate.out) / 1_000_000;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/providers", async (_req, res) => {
  await ensureSeeded();
  const providers = await Provider.find({}).sort({ name: 1 }).lean();
  // Strip API keys from response (send masked)
  const safe = providers.map((p) => ({
    ...p,
    apiKey: p.apiKey ? "••••" + p.apiKey.slice(-4) : "",
    hasKey: !!p.apiKey,
  }));
  res.json({ providers: safe });
});

router.patch("/providers/:name", async (req, res) => {
  await ensureSeeded();
  const { apiKey, baseUrl, label, models, enabled } = req.body;
  const update = {};
  if (apiKey !== undefined) update.apiKey = apiKey;
  if (baseUrl !== undefined) update.baseUrl = baseUrl;
  if (label !== undefined) update.label = label;
  if (models !== undefined) update.models = models;
  if (enabled !== undefined) update.enabled = enabled;
  const provider = await Provider.findOneAndUpdate(
    { name: req.params.name },
    update,
    { new: true }
  );
  if (!provider) return res.status(404).json({ error: "Provider not found" });
  res.json({ provider: { ...provider.toObject(), apiKey: provider.apiKey ? "••••" + provider.apiKey.slice(-4) : "" } });
});

// GET /models — flat list of all models across enabled providers
router.get("/models", async (_req, res) => {
  await ensureSeeded();
  const providers = await Provider.find({ enabled: true }).lean();
  const allModels = [];
  for (const p of providers) {
    for (const m of p.models) {
      allModels.push({ ...m, provider: p.name, providerLabel: p.label, hasKey: !!p.apiKey });
    }
  }
  res.json({ models: allModels });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/agents", async (_req, res) => {
  await ensureSeeded();
  const agents = await Agent.find({}).sort({ pinned: -1, updatedAt: -1 }).lean();
  // Attach conversation count & last message
  const enriched = await Promise.all(
    agents.map(async (a) => {
      const convos = await Conversation.find({ agentId: a._id, archived: false })
        .sort({ updatedAt: -1 })
        .select("title updatedAt messages")
        .lean();
      const lastConvo = convos[0];
      const lastMsg = lastConvo?.messages?.length
        ? lastConvo.messages[lastConvo.messages.length - 1]
        : null;
      return {
        ...a,
        conversationCount: convos.length,
        totalMessages: convos.reduce((s, c) => s + (c.messages?.length || 0), 0),
        lastMessage: lastMsg?.content?.slice(0, 100) || "",
        lastRole: lastMsg?.role || null,
        lastConvoTitle: lastConvo?.title || "",
      };
    })
  );
  res.json({ agents: enriched });
});

router.post("/agents", async (req, res) => {
  const { name, emoji, role, provider, model, systemPrompt, soul, identity } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const agent = await Agent.create({
    name, emoji: emoji || "🤖", role: role || "Assistant",
    provider: provider || "moonshot", model: model || "kimi-k2.5",
    systemPrompt: systemPrompt || "", soul: soul || "", identity: identity || "",
  });
  // Create first conversation automatically
  await Conversation.create({ agentId: agent._id, title: "Chat 1" });
  res.json({ agent });
});

router.get("/agents/:id", async (req, res) => {
  const agent = await Agent.findById(req.params.id).lean();
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json({ agent });
});

router.patch("/agents/:id", async (req, res) => {
  const allowed = ["name", "emoji", "role", "provider", "model", "systemPrompt", "soul", "identity", "memory", "pinned"];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
  const agent = await Agent.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json({ agent });
});

router.delete("/agents/:id", async (req, res) => {
  await Agent.findByIdAndDelete(req.params.id);
  await Conversation.deleteMany({ agentId: req.params.id });
  res.json({ success: true });
});

// Export agent config
router.get("/agents/:id/export", async (req, res) => {
  const agent = await Agent.findById(req.params.id).lean();
  if (!agent) return res.status(404).json({ error: "Not found" });
  const { _id, __v, createdAt, updatedAt, lastActive, totalTokensIn, totalTokensOut, totalMessages, totalCost, ...exportable } = agent;
  res.json({ agent: exportable });
});

// Import agent config
router.post("/agents/import", async (req, res) => {
  const { agent: config } = req.body;
  if (!config?.name) return res.status(400).json({ error: "Invalid agent config" });
  const agent = await Agent.create(config);
  await Conversation.create({ agentId: agent._id, title: "Chat 1" });
  res.json({ agent });
});

// ─── Memory ─────────────────────────────────────────────────────────────────

router.post("/agents/:id/memory", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ error: "Not found" });
  const date = new Date().toISOString().slice(0, 10);
  agent.memoryNotes.push({ date, content });
  // Append to long-term memory
  agent.memory = (agent.memory ? agent.memory + "\n" : "") + `[${date}] ${content}`;
  await agent.save();
  res.json({ success: true, memoryNotes: agent.memoryNotes });
});

router.get("/agents/:id/memory", async (req, res) => {
  const agent = await Agent.findById(req.params.id).select("memory memoryNotes").lean();
  if (!agent) return res.status(404).json({ error: "Not found" });
  res.json({ memory: agent.memory, notes: agent.memoryNotes });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/agents/:id/conversations", async (req, res) => {
  const convos = await Conversation.find({ agentId: req.params.id, archived: false })
    .sort({ pinned: -1, updatedAt: -1 })
    .lean();
  const list = convos.map((c) => ({
    ...c,
    messageCount: c.messages?.length || 0,
    lastMessage: c.messages?.length ? c.messages[c.messages.length - 1].content.slice(0, 100) : "",
    lastRole: c.messages?.length ? c.messages[c.messages.length - 1].role : null,
    messages: undefined,
  }));
  res.json({ conversations: list });
});

router.post("/agents/:id/conversations", async (req, res) => {
  const { title } = req.body;
  const convo = await Conversation.create({
    agentId: req.params.id,
    title: title || "New Conversation",
  });
  res.json({ conversation: convo });
});

router.get("/conversations/:id", async (req, res) => {
  const convo = await Conversation.findById(req.params.id).lean();
  if (!convo) return res.status(404).json({ error: "Conversation not found" });
  res.json({ conversation: convo });
});

router.patch("/conversations/:id", async (req, res) => {
  const { title, pinned, archived } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (pinned !== undefined) update.pinned = pinned;
  if (archived !== undefined) update.archived = archived;
  const convo = await Conversation.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!convo) return res.status(404).json({ error: "Not found" });
  res.json({ conversation: convo });
});

router.delete("/conversations/:id", async (req, res) => {
  await Conversation.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.delete("/conversations/:id/messages", async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ error: "Not found" });
  convo.messages = [];
  convo.tokensIn = 0;
  convo.tokensOut = 0;
  convo.cost = 0;
  await convo.save();
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEND MESSAGE (streaming, with failover)
// ═══════════════════════════════════════════════════════════════════════════════

const COOLDOWN_STEPS = [30_000, 60_000, 300_000]; // 30s, 1m, 5m

async function getProviderForAgent(agent) {
  const provider = await Provider.findOne({ name: agent.provider, enabled: true });
  if (!provider || !provider.apiKey) return null;
  // Check cooldown
  if (provider.cooldownUntil && new Date() < provider.cooldownUntil) return null;
  return provider;
}

async function markProviderFail(provider) {
  const step = Math.min(provider.failCount, COOLDOWN_STEPS.length - 1);
  const cooldownMs = COOLDOWN_STEPS[step];
  provider.failCount += 1;
  provider.cooldownUntil = new Date(Date.now() + cooldownMs);
  await provider.save();
}

async function markProviderSuccess(provider) {
  if (provider.failCount > 0) {
    provider.failCount = 0;
    provider.cooldownUntil = null;
    await provider.save();
  }
}

router.post("/conversations/:id/send", async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const agent = await Agent.findById(convo.agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const provider = await getProviderForAgent(agent);
    if (!provider) {
      return res.status(500).json({ error: `Provider "${agent.provider}" not configured or in cooldown. Add an API key in Settings.` });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    // Save user message
    convo.messages.push({ role: "user", content });
    // Auto-title on first user message
    if (convo.messages.filter((m) => m.role === "user").length === 1 && convo.title === "New Conversation") {
      convo.title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
    }
    await convo.save();

    // Build API messages
    const apiMessages = [];
    // System prompt = systemPrompt + soul + identity + memory
    const systemParts = [agent.systemPrompt, agent.soul, agent.identity].filter(Boolean);
    if (agent.memory) systemParts.push(`\n## Memory\n${agent.memory}`);
    if (systemParts.length) {
      apiMessages.push({ role: "system", content: systemParts.join("\n\n") });
    }
    for (const m of convo.messages) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    // SSE stream
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const startMs = Date.now();

    const fetchRes = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: agent.model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      // Rate limit or server error — cool down provider
      if (fetchRes.status === 429 || fetchRes.status >= 500) {
        await markProviderFail(provider);
      }
      res.write(`data: ${JSON.stringify({ type: "error", text: `${provider.label} ${fetchRes.status}: ${errText.slice(0, 200)}` })}\n\n`);
      res.end();
      return;
    }

    await markProviderSuccess(provider);

    let fullContent = "";
    let thinkingContent = "";
    const reader = fetchRes.body.getReader();
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
          if (!delta) continue;

          // Thinking content (Kimi K2.5, DeepSeek R1)
          if (delta.reasoning_content) {
            thinkingContent += delta.reasoning_content;
            res.write(`data: ${JSON.stringify({ type: "thinking", text: delta.reasoning_content })}\n\n`);
          }
          // Regular content
          if (delta.content) {
            fullContent += delta.content;
            res.write(`data: ${JSON.stringify({ type: "token", text: delta.content })}\n\n`);
          }
        } catch {}
      }
    }

    const responseMs = Date.now() - startMs;
    // Rough token estimate: 1 token ≈ 4 chars
    const estTokensIn = Math.ceil(apiMessages.reduce((s, m) => s + m.content.length, 0) / 4);
    const estTokensOut = Math.ceil(fullContent.length / 4);
    const cost = estimateCost(agent.model, estTokensIn, estTokensOut);

    // Save assistant message
    convo.messages.push({
      role: "assistant", content: fullContent,
      thinking: thinkingContent, tokensIn: estTokensIn, tokensOut: estTokensOut, responseMs,
    });
    convo.tokensIn += estTokensIn;
    convo.tokensOut += estTokensOut;
    convo.cost += cost;
    await convo.save();

    // Update agent totals
    agent.totalTokensIn += estTokensIn;
    agent.totalTokensOut += estTokensOut;
    agent.totalMessages += 2;
    agent.totalCost += cost;
    agent.lastActive = new Date();
    await agent.save();

    res.write(`data: ${JSON.stringify({
      type: "done", fullContent, thinking: thinkingContent,
      tokensIn: estTokensIn, tokensOut: estTokensOut, responseMs, cost,
    })}\n\n`);
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

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

router.get("/analytics", async (_req, res) => {
  const agents = await Agent.find({}).lean();
  const totals = {
    agents: agents.length,
    totalTokensIn: agents.reduce((s, a) => s + a.totalTokensIn, 0),
    totalTokensOut: agents.reduce((s, a) => s + a.totalTokensOut, 0),
    totalMessages: agents.reduce((s, a) => s + a.totalMessages, 0),
    totalCost: agents.reduce((s, a) => s + a.totalCost, 0),
    perAgent: agents.map((a) => ({
      _id: a._id, name: a.name, emoji: a.emoji,
      tokensIn: a.totalTokensIn, tokensOut: a.totalTokensOut,
      messages: a.totalMessages, cost: a.totalCost,
      lastActive: a.lastActive,
    })),
  };
  res.json(totals);
});

export default router;
