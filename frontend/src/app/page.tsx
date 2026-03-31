"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAgents, useModels, useConversations,
  fetchAgent, fetchConversation, createAgent, createConversation,
  patchAgent, deleteAgent, deleteConversation, clearConvoMessages,
  sendMessageStream, addMemoryNote, exportAgent, importAgent,
  type Agent, type ChatMessage, type Conversation, type ModelInfo,
} from "@/lib/hooks";

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function Home() {
  const { agents, loading, refresh } = useAgents();
  const models = useModels();
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const { convos, refresh: refreshConvos } = useConversations(activeAgentId);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConvos, setShowConvos] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryInput, setMemoryInput] = useState("");
  // New agent form
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🤖");
  const [newRole, setNewRole] = useState("");
  const [newProvider, setNewProvider] = useState("moonshot");
  const [newModel, setNewModel] = useState("kimi-k2.5");
  const [newPrompt, setNewPrompt] = useState("");

  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Group models by provider
  const providers = [...new Set(models.map((m) => m.provider))];
  const modelsByProvider = (p: string) => models.filter((m) => m.provider === p);

  const selectAgent = useCallback(async (id: string) => {
    setActiveAgentId(id);
    setSidebar(false);
    setShowNew(false);
    setShowSettings(false);
    setShowMemory(false);
    setShowConvos(false);
    const a = await fetchAgent(id);
    if (a) setActiveAgent(a);
    // Load first conversation
    setActiveConvoId(null);
    setMessages([]);
  }, []);

  // When convos load, auto-select first
  useEffect(() => {
    if (convos.length > 0 && !activeConvoId) {
      loadConvo(convos[0]._id);
    }
  }, [convos]);

  const loadConvo = async (id: string) => {
    setActiveConvoId(id);
    setShowConvos(false);
    const c = await fetchConversation(id);
    if (c) setMessages(c.messages || []);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const agent = await createAgent({
      name: newName.trim(), emoji: newEmoji || "🤖", role: newRole.trim() || "Assistant",
      provider: newProvider, model: newModel, systemPrompt: newPrompt.trim(),
    });
    await refresh();
    setShowNew(false);
    setNewName(""); setNewEmoji("🤖"); setNewRole(""); setNewPrompt("");
    selectAgent(agent._id);
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
    await refresh();
    if (activeAgentId === id) {
      setActiveAgentId(null); setActiveAgent(null); setMessages([]); setActiveConvoId(null);
    }
  };

  const handleNewConvo = async () => {
    if (!activeAgentId) return;
    const c = await createConversation(activeAgentId);
    await refreshConvos();
    loadConvo(c._id);
  };

  const handleDeleteConvo = async (id: string) => {
    await deleteConversation(id);
    await refreshConvos();
    if (activeConvoId === id) {
      setActiveConvoId(null); setMessages([]);
    }
  };

  const handleClear = async () => {
    if (!activeConvoId) return;
    await clearConvoMessages(activeConvoId);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || streaming || !activeConvoId) return;
    const content = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content }]);
    setStreaming(true);
    setStreamText("");
    setThinkingText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await sendMessageStream(activeConvoId, content, controller.signal);

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
      let thinking = "";

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
            if (parsed.type === "token") { full += parsed.text; setStreamText(full); }
            else if (parsed.type === "thinking") { thinking += parsed.text; setThinkingText(thinking); }
            else if (parsed.type === "error") { full += `\n[Error: ${parsed.text}]`; setStreamText(full); }
          } catch {}
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full, thinking }]);
      setStreamText("");
      setThinkingText("");
      refresh();
      refreshConvos();
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${(err as Error).message}` }]);
      }
    } finally { setStreaming(false); abortRef.current = null; }
  };

  const handleStop = () => abortRef.current?.abort();

  const handleModelChange = async (fullId: string) => {
    if (!activeAgentId) return;
    // fullId = "provider/model"
    const [prov, ...rest] = fullId.split("/");
    const modelId = rest.join("/");
    await patchAgent(activeAgentId, { provider: prov, model: modelId });
    setActiveAgent((p) => p ? { ...p, provider: prov, model: modelId } : p);
    refresh();
  };

  const handleSaveSettings = async () => {
    if (!activeAgentId || !activeAgent) return;
    await patchAgent(activeAgentId, {
      name: activeAgent.name, emoji: activeAgent.emoji, role: activeAgent.role,
      systemPrompt: activeAgent.systemPrompt, soul: activeAgent.soul, identity: activeAgent.identity,
    });
    refresh();
    setShowSettings(false);
  };

  const handleAddMemory = async () => {
    if (!activeAgentId || !memoryInput.trim()) return;
    await addMemoryNote(activeAgentId, memoryInput.trim());
    setMemoryInput("");
    const a = await fetchAgent(activeAgentId);
    if (a) setActiveAgent(a);
  };

  const handleExport = async () => {
    if (!activeAgentId) return;
    const config = await exportAgent(activeAgentId);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeAgent?.name || "agent"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const config = JSON.parse(text);
        const agent = await importAgent(config);
        await refresh();
        selectAgent(agent._id);
      } catch {}
    };
    inp.click();
  };

  const currentModelKey = activeAgent ? `${activeAgent.provider}/${activeAgent.model}` : "";

  return (
    <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-56px)]">
      {/* Mobile overlay */}
      {sidebar && <div className="fixed inset-0 bg-black/50 z-30 sm:hidden" onClick={() => setSidebar(false)} />}

      {/* ── Agent Sidebar ── */}
      <div className={`${sidebar ? "translate-x-0" : "-translate-x-full sm:translate-x-0"} fixed sm:relative z-40 sm:z-auto w-72 sm:w-64 lg:w-72 h-full border-r border-white/10 bg-[#0a0e1a] sm:bg-transparent flex flex-col transition-transform duration-200`}>
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300">Agents</h3>
          <div className="flex gap-1">
            <button onClick={handleImport} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] transition-colors" title="Import agent">↑</button>
            <button onClick={() => { setShowNew(true); setSidebar(false); }} className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-sm transition-colors" title="New agent">+</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />) : agents.map((a) => (
            <div key={a._id} onClick={() => selectAgent(a._id)} className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${activeAgentId === a._id ? "bg-blue-500/15 border border-blue-500/30" : "hover:bg-white/5 border border-transparent"}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-base shrink-0">{a.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium truncate">{a.name}</p>
                  {a.pinned && <span className="text-[9px] text-yellow-500">★</span>}
                  <span className="text-[9px] text-gray-600 ml-auto shrink-0">{timeAgo(a.lastActive || a.updatedAt)}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{a.role}</p>
                {a.lastMessage && <p className="text-[10px] text-gray-600 truncate">{a.lastRole === "assistant" ? `${a.emoji} ` : "You: "}{a.lastMessage}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(a._id); }} className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded text-gray-600 hover:text-red-400 flex items-center justify-center text-xs transition-all shrink-0">×</button>
            </div>
          ))}
          {!loading && agents.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <p className="text-3xl">🤖</p>
              <p className="text-xs text-gray-500">No agents yet</p>
              <button onClick={() => setShowNew(true)} className="text-xs text-blue-400 hover:text-blue-300">Create your first agent</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 shrink-0">
          <button onClick={() => setSidebar(!sidebar)} className="sm:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">☰</button>

          {activeAgent ? (
            <>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-base">{activeAgent.emoji}</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold truncate">{activeAgent.name}</h3>
                <p className="text-[10px] text-gray-500 truncate">{activeAgent.role}</p>
              </div>
              {/* Conversation switcher */}
              <button onClick={() => setShowConvos(!showConvos)} className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 transition-colors truncate max-w-[120px]" title="Switch conversation">
                {convos.find((c) => c._id === activeConvoId)?.title || "Conversations"}
              </button>
              {/* Model selector */}
              <select value={currentModelKey} onChange={(e) => handleModelChange(e.target.value)} className="hidden sm:block px-2 py-1 rounded-lg bg-[#1a1f2e] border border-white/10 text-[10px] text-gray-200 focus:outline-none max-w-[160px]">
                {providers.map((p) => (
                  <optgroup key={p} label={models.find((m) => m.provider === p)?.providerLabel || p}>
                    {modelsByProvider(p).map((m) => (
                      <option key={`${p}/${m.id}`} value={`${p}/${m.id}`}>{m.name} ({m.ctx}){!m.hasKey ? " ⚠" : ""}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button onClick={() => setShowMemory(!showMemory)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] transition-colors" title="Memory">🧠</button>
              <button onClick={handleExport} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] transition-colors" title="Export agent">↓</button>
              <button onClick={handleClear} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] transition-colors" title="Clear chat">🗑</button>
              <button onClick={() => setShowSettings(!showSettings)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] transition-colors" title="Settings">⚙</button>
            </>
          ) : (
            <div className="flex-1"><h3 className="text-sm font-semibold text-gray-400">Agent Office</h3><p className="text-[10px] text-gray-600">Select or create an agent</p></div>
          )}
        </div>

        {/* Conversation switcher dropdown */}
        {showConvos && activeAgentId && (
          <div className="border-b border-white/10 bg-white/[0.02] p-3 space-y-1 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Conversations</span>
              <button onClick={handleNewConvo} className="text-[10px] text-blue-400 hover:text-blue-300">+ New</button>
            </div>
            {convos.map((c) => (
              <div key={c._id} onClick={() => loadConvo(c._id)} className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeConvoId === c._id ? "bg-blue-500/15" : "hover:bg-white/5"}`}>
                <div className="min-w-0">
                  <p className="text-xs truncate">{c.title}</p>
                  <p className="text-[10px] text-gray-600">{c.messageCount} msgs · {timeAgo(c.updatedAt)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteConvo(c._id); }} className="opacity-0 group-hover:opacity-100 text-xs text-gray-600 hover:text-red-400">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Settings panel */}
        {showSettings && activeAgent && (
          <div className="border-b border-white/10 bg-white/[0.02] p-4 space-y-3 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-2">
              <input value={activeAgent.emoji} onChange={(e) => setActiveAgent((p) => p ? { ...p, emoji: e.target.value } : p)} className="w-11 px-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-center text-lg focus:outline-none focus:border-blue-500" maxLength={4} />
              <input value={activeAgent.name} onChange={(e) => setActiveAgent((p) => p ? { ...p, name: e.target.value } : p)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500" placeholder="Name" />
              <input value={activeAgent.role} onChange={(e) => setActiveAgent((p) => p ? { ...p, role: e.target.value } : p)} className="col-span-2 sm:col-span-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500" placeholder="Role" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">System Prompt</label>
              <textarea value={activeAgent.systemPrompt} onChange={(e) => setActiveAgent((p) => p ? { ...p, systemPrompt: e.target.value } : p)} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" placeholder="How should this agent behave?" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Soul (Persona)</label>
                <textarea value={activeAgent.soul || ""} onChange={(e) => setActiveAgent((p) => p ? { ...p, soul: e.target.value } : p)} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" placeholder="Deep personality traits..." />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Identity</label>
                <textarea value={activeAgent.identity || ""} onChange={(e) => setActiveAgent((p) => p ? { ...p, identity: e.target.value } : p)} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" placeholder="Name, background, expertise..." />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] text-gray-600 mr-auto">{activeAgent.totalMessages} msgs · ${activeAgent.totalCost?.toFixed(4)} cost</span>
              <button onClick={() => setShowSettings(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-white/5">Cancel</button>
              <button onClick={handleSaveSettings} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium transition-colors">Save</button>
            </div>
          </div>
        )}

        {/* Memory panel */}
        {showMemory && activeAgent && (
          <div className="border-b border-white/10 bg-white/[0.02] p-4 space-y-2 max-h-64 overflow-y-auto">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Agent Memory</span>
            {activeAgent.memoryNotes?.length ? (
              <div className="space-y-1">
                {activeAgent.memoryNotes.slice(-10).reverse().map((n, i) => (
                  <div key={i} className="text-xs text-gray-400 px-2 py-1 rounded bg-white/[0.03]">
                    <span className="text-gray-600 text-[10px]">{n.date}</span> {n.content}
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-600">No memory notes yet</p>}
            <div className="flex gap-2">
              <input value={memoryInput} onChange={(e) => setMemoryInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddMemory(); }} placeholder="Add a memory note..." className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-500" />
              <button onClick={handleAddMemory} disabled={!memoryInput.trim()} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-xs font-medium transition-colors">Add</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!activeAgentId ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-4xl">🤖</div>
              <div className="text-center">
                <p className="text-gray-300 font-semibold text-lg">Agent Office</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Create agents with custom personas, memory, and multi-provider LLM support</p>
              </div>
              <button onClick={() => setShowNew(true)} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors">Create Agent</button>
            </div>
          ) : !activeConvoId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <span className="text-4xl">{activeAgent?.emoji}</span>
              <p className="text-xs text-gray-600">Loading conversations...</p>
            </div>
          ) : messages.length === 0 && !streaming ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <span className="text-4xl">{activeAgent?.emoji}</span>
              <p className="text-sm font-medium text-gray-400">{activeAgent?.name}</p>
              <p className="text-xs text-gray-600">{activeAgent?.role} · {activeAgent?.model}</p>
              <p className="text-[10px] text-gray-700 mt-2">Send a message to start chatting</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-xs shrink-0">{activeAgent?.emoji || "🤖"}</div>
                  )}
                  <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                    {/* Thinking block */}
                    {msg.thinking && (
                      <details className="text-[10px]">
                        <summary className="cursor-pointer text-purple-400/60 hover:text-purple-400">💭 Thinking ({msg.thinking.length} chars)</summary>
                        <div className="mt-1 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-gray-500 whitespace-pre-wrap break-words text-[10px] max-h-40 overflow-y-auto">{msg.thinking}</div>
                      </details>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-md" : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-md"}`}>{msg.content}</div>
                    {/* Token info */}
                    {msg.role === "assistant" && (msg.tokensIn || msg.responseMs) && (
                      <p className="text-[9px] text-gray-700 px-1">
                        {msg.tokensIn ? `${msg.tokensIn}→${msg.tokensOut} tok` : ""}{msg.responseMs ? ` · ${(msg.responseMs / 1000).toFixed(1)}s` : ""}
                      </p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border border-white/10 flex items-center justify-center text-xs shrink-0">👤</div>
                  )}
                </div>
              ))}

              {/* Streaming */}
              {streaming && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-xs shrink-0 animate-pulse">{activeAgent?.emoji || "🤖"}</div>
                  <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                    {thinkingText && (
                      <div className="px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] text-gray-500 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                        💭 {thinkingText}
                      </div>
                    )}
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                      {streamText || <span className="text-gray-500 animate-pulse">Thinking...</span>}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Input */}
        {activeConvoId && (
          <div className="px-4 py-3 border-t border-white/10 shrink-0">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={`Message ${activeAgent?.name || "agent"}...`} rows={1} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none max-h-32" style={{ minHeight: "42px" }} />
              {streaming ? (
                <button onClick={handleStop} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors shrink-0">Stop</button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors shrink-0">Send</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── New Agent Modal ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#111827]">
              <h3 className="font-bold text-sm">New Agent</h3>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Emoji</label>
                  <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="w-14 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-center text-lg focus:outline-none focus:border-blue-500" maxLength={4} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Kimi, Atlas, Nova..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500" autoFocus />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Code Assistant, Writing Coach..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Model</label>
                <select value={`${newProvider}/${newModel}`} onChange={(e) => { const [p, ...r] = e.target.value.split("/"); setNewProvider(p); setNewModel(r.join("/")); }} className="w-full px-3 py-2 rounded-lg bg-[#1a1f2e] border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-blue-500">
                  {providers.map((p) => (
                    <optgroup key={p} label={models.find((m) => m.provider === p)?.providerLabel || p}>
                      {modelsByProvider(p).map((m) => (
                        <option key={`${p}/${m.id}`} value={`${p}/${m.id}`}>{m.name} ({m.ctx}){!m.hasKey ? " ⚠ no key" : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">System Prompt</label>
                <textarea value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} rows={3} placeholder="Define how this agent should behave..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <button onClick={handleCreate} disabled={!newName.trim()} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors">Create Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
