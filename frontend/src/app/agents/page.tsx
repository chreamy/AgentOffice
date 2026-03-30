"use client";

import { useAgents, updateAgentStatus, type LiveAgent } from "@/lib/hooks";

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const STATUS_DOT: Record<string, string> = {
  working: "bg-amber-400",
  idle: "bg-emerald-400",
  researching: "bg-blue-400",
  syncing: "bg-purple-400",
  error: "bg-red-400",
};

const STATUS_STYLE: Record<string, string> = {
  working: "bg-amber-500/20 text-amber-400",
  idle: "bg-emerald-500/20 text-emerald-400",
  researching: "bg-blue-500/20 text-blue-400",
  syncing: "bg-purple-500/20 text-purple-400",
  error: "bg-red-500/20 text-red-400",
};

export default function AgentsPage() {
  const { data: agents, loading } = useAgents();

  const handleCycleStatus = async (a: LiveAgent) => {
    const order = ["idle", "working", "researching", "syncing", "error"] as const;
    const next = order[(order.indexOf(a.status) + 1) % order.length];
    await updateAgentStatus(a.agentId, { status: next as LiveAgent["status"] });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Agent Presence</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time status via WebSocket stream
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
          {agents.length} agents
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            ))
          : agents.map((agent) => (
              <div
                key={agent.agentId}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${"from-blue-500 to-purple-600"}`}
                />
                <div className="p-5 space-y-4">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${"from-blue-500 to-purple-600"} flex items-center justify-center text-xl shadow-lg`}
                      >
                        {agent.emoji}
                      </div>
                      <button
                        onClick={() => handleCycleStatus(agent)}
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0e1a] ${STATUS_DOT[agent.status] ?? "bg-gray-500"} cursor-pointer hover:scale-125 transition-transform`}
                        title="Click to cycle status"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{agent.name}</h3>
                      <p className="text-[11px] text-gray-500">{agent.role}</p>
                    </div>
                  </div>

                  {/* Location + task */}
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <p>📍 {agent.location}</p>
                    <p className="truncate">🔧 {agent.currentTask}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                    <div>
                      <p className="text-sm font-bold">{agent.tasksCompleted}</p>
                      <p className="text-[10px] text-gray-500">Tasks</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{agent.uptime}</p>
                      <p className="text-[10px] text-gray-500">Uptime</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{agent.responseTime}</p>
                      <p className="text-[10px] text-gray-500">Resp</p>
                    </div>
                  </div>

                  {/* Status badge + last seen */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCycleStatus(agent)}
                      className={`text-[11px] px-3 py-1 rounded-full capitalize cursor-pointer hover:opacity-80 ${STATUS_STYLE[agent.status] ?? "bg-gray-500/20 text-gray-400"}`}
                    >
                      {agent.status}
                    </button>
                    <span className="text-[10px] text-gray-600">
                      {timeAgo(agent.lastSeen)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
