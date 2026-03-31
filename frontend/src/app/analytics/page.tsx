"use client";

import { useAnalytics } from "@/lib/hooks";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function timeAgo(d: string) {
  if (!d) return "never";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AnalyticsPage() {
  const { data, refresh } = useAnalytics();

  if (!data) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Analytics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-xs text-gray-500 mt-1">Token usage, costs, and agent activity</p>
        </div>
        <button onClick={refresh} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors">Refresh</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Agents</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">{data.agents}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Messages</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{fmt(data.totalMessages)}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tokens Used</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{fmt(data.totalTokensIn + data.totalTokensOut)}</p>
          <p className="text-[10px] text-gray-600">{fmt(data.totalTokensIn)} in · {fmt(data.totalTokensOut)} out</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Cost</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">${data.totalCost.toFixed(4)}</p>
        </div>
      </div>

      {/* Per-agent breakdown */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Per-Agent Usage</h3>
        </div>
        {data.perAgent.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">No agent data yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.perAgent.map((a) => {
              const totalTokens = a.tokensIn + a.tokensOut;
              const maxTokens = Math.max(...data.perAgent.map((x) => x.tokensIn + x.tokensOut), 1);
              const pct = (totalTokens / maxTokens) * 100;
              return (
                <div key={a._id} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-lg shrink-0">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{a.name}</span>
                      <span className="text-[10px] text-gray-600">Last active {timeAgo(a.lastActive)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{fmt(totalTokens)} tok</p>
                    <p className="text-[10px] text-gray-500">{a.messages} msgs · ${a.cost.toFixed(4)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
