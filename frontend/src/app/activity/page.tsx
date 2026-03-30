"use client";

import { useActivity } from "@/lib/hooks";

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const ACTIVITY_DOT: Record<string, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
};

export default function ActivityPage() {
  const { data: activities, loading } = useActivity();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Activity Feed</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Real-time events streamed from all agents
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-base">📡 No activity yet</p>
          <p className="text-xs mt-1">
            Agent events will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <div
              key={a._id}
              className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${ACTIVITY_DOT[a.type] ?? "bg-gray-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{a.agentEmoji}</span>
                    <span className="font-medium text-sm">{a.agentName}</span>
                    {a.metadata && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                        {a.metadata}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 ml-auto">
                      {timeAgo(a.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{a.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
