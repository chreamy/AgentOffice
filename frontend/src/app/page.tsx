"use client";

import {
  useAgents,
  useTasks,
  useActivity,
  useStats,
} from "@/lib/hooks";

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_DOT: Record<string, string> = {
  working: "bg-amber-400",
  idle: "bg-emerald-400",
  researching: "bg-blue-400",
  syncing: "bg-purple-400",
  error: "bg-red-400",
};

const AGENT_BG: Record<string, string> = {
  kiyo: "from-blue-600 to-cyan-500",
  arch: "from-amber-500 to-orange-500",
  nova: "from-purple-500 to-pink-500",
  atlas: "from-emerald-500 to-green-400",
  echo: "from-rose-500 to-red-400",
};

const ACTIVITY_DOT: Record<string, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
};

export default function CommandPage() {
  const { data: agents, loading: agentsLoading } = useAgents();
  const { data: tasks } = useTasks();
  const { data: activities } = useActivity();
  const { data: stats } = useStats();

  const activeTasks = tasks.filter((t) => t.status === "in-progress").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            OpenClaw Dashboard
          </h2>
          <p className="text-white/70 text-sm sm:text-base">
            {agentsLoading
              ? "Connecting to stream..."
              : `${stats.totalAgents} agents connected · ${activeTasks} active · ${doneTasks} completed`}
          </p>
        </div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Active Tasks", value: activeTasks, color: "text-amber-400" },
          { label: "Completed", value: doneTasks, color: "text-emerald-400" },
          { label: "Total Tasks", value: stats.totalTasks, color: "text-blue-400" },
          {
            label: "Agents Online",
            value: `${stats.agentsOnline}/${stats.totalAgents}`,
            color: "text-purple-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-4"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Agent summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent cards */}
        <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            🧠 Agent Activity
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400">
              Live
            </span>
          </h3>
          <div className="space-y-3">
            {agentsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))
              : agents.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AGENT_BG[agent.agentId] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-lg`}
                      >
                        {agent.emoji}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${STATUS_DOT[agent.status] ?? "bg-gray-500"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <span className="text-[10px] text-gray-500 hidden sm:inline">
                          {agent.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {agent.currentTask}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                        agent.status === "working"
                          ? "bg-amber-500/20 text-amber-400"
                          : agent.status === "idle"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : agent.status === "error"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5">
          <h3 className="font-semibold mb-4 text-sm">🕐 Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map((a) => (
                <div key={a._id} className="flex items-start gap-2.5 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 shrink-0 ${ACTIVITY_DOT[a.type] ?? "bg-gray-400"}`}
                  />
                  <div className="min-w-0">
                    <p>
                      <span className="font-medium">
                        {a.agentEmoji} {a.agentName}
                      </span>{" "}
                      <span className="text-gray-400">{a.message}</span>
                    </p>
                    <p className="text-gray-600 text-[10px]">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
