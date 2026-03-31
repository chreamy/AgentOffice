"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAgents, type LiveAgent } from "@/lib/hooks";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatSession {
  _id: string;
  title: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
  messageCount: number;
  lastMessage: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KimiModel {
  id: string;
  name: string;
  ctx: string;
}

// ─── API helpers ────────────────────────────────────────────────────────────

async function fetchSessions(): Promise<ChatSession[]> {
  const r = await fetch(`${API}/api/chat/sessions`);
  const j = await r.json();
  return j.sessions || [];
}

async function fetchSession(id: string): Promise<ChatSession | null> {
  const r = await fetch(`${API}/api/chat/sessions/${id}`);
  const j = await r.json();
  return j.session || null;
}

async function createSession(data: Partial<ChatSession>): Promise<ChatSession> {
  const r = await fetch(`${API}/api/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json();
  return j.session;
}

async function patchSession(id: string, data: Record<string, unknown>) {
  await fetch(`${API}/api/chat/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function deleteSession(id: string) {
  await fetch(`${API}/api/chat/sessions/${id}`, { method: "DELETE" });
}

async function fetchModels(): Promise<KimiModel[]> {
  const r = await fetch(`${API}/api/chat/models`);
  const j = await r.json();
  return j.models || [];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: agents } = useAgents();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [models, setModels] = useState<KimiModel[]>([]);
  const [sidebar, setSidebar] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newAgent, setNewAgent] = useState("");
  const [newModel, setNewModel] = useState("kimi-k2.5");
  const [newPrompt, setNewPrompt] = useState("");
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load sessions & models on mount
  useEffect(() => {
    fetchSessions().then(setSessions);
    fetchModels().then(setModels);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Load session messages when active changes
  const loadSession = useCallback(async (id: string) => {
    setActiveId(id);
    setSidebar(false);
    setShowNew(false);
    setShowSettings(false);
    const s = await fetchSession(id);
    if (s) {
      setMessages(s.messages || []);
      setActiveSession(s);
    }
  }, []);

  // Create new session
  const handleCreate = async () => {
    const agent = agents.find((a) => a.agentId === newAgent);
    const session = await createSession({
      agentId: agent?.agentId || "",
      agentName: agent?.name || "General",
      agentEmoji: agent?.emoji || "💬",
      model: newModel,
      systemPrompt: newPrompt || (agent ? `You are ${agent.name}, ${agent.role}. Be helpful and concise.` : ""),
    });
    setSessions((prev) => [session, ...prev]);
    setShowNew(false);
    setNewPrompt("");
    loadSession(session._id);
  };

  // Delete session
  const handleDelete = async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s._id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
      setActiveSession(null);
    }
  };

  // Send message & stream response
  const handleSend = async () => {
    if (!input.trim() || streaming || !activeId) return;
    const content = input.trim();
    setInput("");

    // Optimistically add user message
    const userMsg: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);

    setStreaming(true);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API}/api/chat/sessions/${activeId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.error}` }]);
        setStreaming(false);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === "token") {
              full += parsed.text;
              setStreamText(full);
            } else if (parsed.type === "error") {
              full += `\n[Error: ${parsed.text}]`;
              setStreamText(full);
            } else if (parsed.type === "done") {
              // Final
            }
          } catch {
            // skip
          }
        }
      }

      // Add assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamText("");

      // Refresh session list for updated title/timestamp
      fetchSessions().then(setSessions);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${(err as Error).message}` },
        ]);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  // Update model for active session
  const handleModelChange = async (model: string) => {
    if (!activeId) return;
    await patchSession(activeId, { model });
    setActiveSession((prev) => prev ? { ...prev, model } : prev);
    setSessions((prev) =>
      prev.map((s) => (s._id === activeId ? { ...s, model } : s))
    );
  };

  const activeModel = activeSession?.model || "kimi-k2.5";

  return (
    <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-56px)] max-w-7xl mx-auto">
      {/* ── Sidebar overlay (mobile) ── */}
      {sidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`${
          sidebar ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        } fixed sm:relative z-40 sm:z-auto w-72 sm:w-64 h-full border-r border-white/10 bg-[#0a0e1a] sm:bg-transparent flex flex-col transition-transform duration-200`}
      >
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold">Chat Sessions</h3>
          <button
            onClick={() => setShowNew(true)}
            className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-sm transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => loadSession(s._id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                activeId === s._id
                  ? "bg-blue-500/15 border border-blue-500/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="text-base shrink-0">{s.agentEmoji || "💬"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{s.title}</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {s.agentName || "General"} · {s.messageCount || 0} msgs
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s._id);
                }}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded text-gray-500 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center text-xs transition-all"
              >
                ×
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-xs text-gray-600 py-8">
              No sessions yet
            </p>
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebar(!sidebar)}
            className="sm:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm"
          >
            ☰
          </button>

          {activeSession ? (
            <>
              <span className="text-lg">{activeSession.agentEmoji || "💬"}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {activeSession.title}
                </h3>
                <p className="text-[10px] text-gray-500">
                  {activeSession.agentName || "General"} · {activeModel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activeModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] focus:outline-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.ctx})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs transition-colors"
                >
                  ⚙
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-400">
                  Kimi Chat
                </h3>
                <p className="text-[10px] text-gray-600">
                  Select or create a session
                </p>
              </div>
            </>
          )}
        </div>

        {/* Settings panel (collapsible) */}
        {showSettings && activeSession && (
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] space-y-2">
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider">
              System Prompt
            </label>
            <textarea
              value={activeSession.systemPrompt}
              onChange={(e) => {
                const val = e.target.value;
                setActiveSession((prev) =>
                  prev ? { ...prev, systemPrompt: val } : prev
                );
              }}
              onBlur={() => {
                if (activeId && activeSession)
                  patchSession(activeId, {
                    systemPrompt: activeSession.systemPrompt,
                  });
              }}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Custom system prompt..."
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!activeId ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-3xl">
                🌙
              </div>
              <div className="text-center">
                <p className="text-gray-400 font-medium">Kimi Chat</p>
                <p className="text-xs text-gray-600 mt-1">
                  Powered by Moonshot AI
                </p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
              >
                Start a Chat
              </button>
            </div>
          ) : messages.length === 0 && !streaming ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="text-base">
                {activeSession?.agentEmoji || "💬"} Chat with{" "}
                {activeSession?.agentName || "Kimi"}
              </p>
              <p className="text-xs mt-1 text-gray-600">
                Model: {activeModel}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm shrink-0">
                      {activeSession?.agentEmoji || "🌙"}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm shrink-0">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming indicator */}
              {streaming && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm shrink-0 animate-pulse">
                    {activeSession?.agentEmoji || "🌙"}
                  </div>
                  <div className="max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 text-sm text-gray-200 whitespace-pre-wrap break-words">
                    {streamText || (
                      <span className="text-gray-500 animate-pulse">
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Input */}
        {activeId && (
          <div className="px-4 py-3 border-t border-white/10 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${activeSession?.agentName || "Kimi"}...`}
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none max-h-32"
                style={{ minHeight: "40px" }}
              />
              {streaming ? (
                <button
                  onClick={handleStop}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors shrink-0"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors shrink-0"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── New Session Modal ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm">New Chat Session</h3>
              <button
                onClick={() => setShowNew(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Agent picker */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                  Agent (optional)
                </label>
                <select
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">General Chat</option>
                  {agents.map((a) => (
                    <option key={a.agentId} value={a.agentId}>
                      {a.emoji} {a.name} — {a.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model picker */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                  Model
                </label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.ctx})
                    </option>
                  ))}
                </select>
              </div>

              {/* System prompt */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                  System Prompt (optional)
                </label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={3}
                  placeholder="Custom instructions for the assistant..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
