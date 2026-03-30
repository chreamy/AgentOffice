"use client";

import { useState, useRef, useEffect } from "react";
import { useAgents, useMessages, sendMessage } from "@/lib/hooks";

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}


export default function CollabPage() {
  const { data: agents } = useAgents();
  const { data: messages, loading } = useMessages();
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendAs, setSendAs] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Default to first agent once loaded
  useEffect(() => {
    if (!sendAs && agents.length > 0) {
      setSendAs(agents[0].agentId);
    }
  }, [agents, sendAs]);

  const handleSend = async () => {
    const content = msgInput.trim();
    if (!content || sending) return;
    const agent = agents.find((a) => a.agentId === sendAs);
    if (!agent) return;
    setSending(true);
    await sendMessage({
      sender: agent.name,
      senderId: agent.agentId,
      senderEmoji: agent.emoji,
      content,
      channel: "general",
      type: "text",
    });
    setMsgInput("");
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-56px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-500">#</span>
          <div>
            <h3 className="font-semibold text-sm">general</h3>
            <p className="text-[10px] text-gray-500">
              {messages.length} messages · streaming live
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
                  <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="text-base">💬 No messages yet</p>
            <p className="text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm sm:text-lg shrink-0"
              >
                {msg.senderEmoji || msg.sender[0]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{msg.sender}</span>
                  <span className="text-[10px] text-gray-600">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5 break-words">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <select
            value={sendAs}
            onChange={(e) => setSendAs(e.target.value)}
            className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none shrink-0"
          >
            {agents.map((a) => (
              <option key={a.agentId} value={a.agentId}>
                {a.emoji} {a.name}
              </option>
            ))}
          </select>
          <input
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message #general..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !msgInput.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
