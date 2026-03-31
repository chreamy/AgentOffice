"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConnectionStatus, useStats } from "@/lib/hooks";

const LINKS = [
  { href: "/", icon: "🎯", label: "Command" },
  { href: "/agents", icon: "🤖", label: "Agents" },
  { href: "/tasks", icon: "✅", label: "Tasks" },
  { href: "/activity", icon: "📡", label: "Activity" },
  { href: "/chat", icon: "🌙", label: "Kimi Chat" },
];

export function Nav() {
  const path = usePathname();
  const conn = useConnectionStatus();
  const { data: stats } = useStats();

  const connColor =
    conn === "connected"
      ? "bg-emerald-400"
      : conn === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-red-400";
  const connLabel =
    conn === "connected"
      ? "Live"
      : conn === "connecting"
        ? "Connecting..."
        : "Offline";

  return (
    <>
      {/* ── Desktop/mobile header ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
            🐾
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm leading-tight">OpenClaw</h1>
            <p className="text-[10px] text-gray-500">Agent Dashboard</p>
          </div>
          <span className="sm:hidden font-bold text-sm">OpenClaw</span>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className={`w-2 h-2 rounded-full ${connColor}`} />
            <span className="hidden sm:inline text-gray-400">{connLabel}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            {stats.agentsOnline}/{stats.totalAgents} agents
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0e1a]/95 backdrop-blur-xl safe-bottom">
        <div className="flex items-center justify-around py-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors rounded-lg ${
                  active
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-gray-500"
                }`}
              >
                <span className="text-lg">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
