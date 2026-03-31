"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", icon: "💬", label: "Chat" },
  { href: "/settings", icon: "⚙", label: "Settings" },
  { href: "/analytics", icon: "📊", label: "Analytics" },
];

export function Nav() {
  const path = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
            🤖
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm leading-tight">Agent Office</h1>
            <p className="text-[10px] text-gray-500">Multi-Agent Chat</p>
          </div>
          <span className="sm:hidden font-bold text-sm">Agent Office</span>
        </Link>

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

        <div className="sm:hidden" />
      </header>

      {/* Mobile bottom tabs */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0e1a]/95 backdrop-blur-xl safe-bottom">
        <div className="flex items-center justify-around py-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors rounded-lg ${
                  active ? "text-blue-400 bg-blue-400/10" : "text-gray-500"
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
