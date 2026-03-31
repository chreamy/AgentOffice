"use client";

import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
          🤖
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight">Agent Office</h1>
          <p className="text-[10px] text-gray-500">Multi-Agent Chat</p>
        </div>
      </Link>
    </header>
  );
}
