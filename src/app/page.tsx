"use client";

import { useState } from "react";
import { AgentPresencePanel } from "@/components/agent-presence-panel";
import { CommandCenter } from "@/components/command-center";
import { AnalyticsObservatory } from "@/components/analytics-observatory";
import { TaskCommand } from "@/components/task-command";
import { CollaborationHub } from "@/components/collaboration-hub";
import { ActivityFeed } from "@/components/activity-feed";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "command",   label: "Command",   emoji: "🎯" },
  { id: "agents",    label: "Agents",    emoji: "🏗️" },
  { id: "analytics", label: "Analytics", emoji: "📊" },
  { id: "tasks",     label: "Tasks",     emoji: "✅" },
  { id: "collab",    label: "Collab",    emoji: "💬" },
  { id: "activity",  label: "Activity",  emoji: "⚡" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("command");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex h-[calc(100vh-64px)]">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Desktop tab bar */}
          <div className="border-b border-border/50 px-4 py-2 flex-shrink-0 flex gap-1 overflow-x-auto">
            {TABS.filter(t => t.id !== "activity").map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {activeTab === "command"   && <CommandCenter />}
            {activeTab === "agents"    && <AgentPresencePanel />}
            {activeTab === "analytics" && <AnalyticsObservatory />}
            {activeTab === "tasks"     && <TaskCommand />}
            {activeTab === "collab"    && <div className="h-[calc(100vh-160px)]"><CollaborationHub /></div>}
          </div>
        </main>

        <ActivityFeed />
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col h-[calc(100vh-56px)]">
        {/* Mobile content area */}
        <div className="flex-1 overflow-auto pb-16">
          <div className="p-4">
            {activeTab === "command"   && <CommandCenter />}
            {activeTab === "agents"    && <AgentPresencePanel />}
            {activeTab === "analytics" && <AnalyticsObservatory />}
            {activeTab === "tasks"     && <TaskCommand />}
            {activeTab === "collab"    && <div className="h-[calc(100vh-200px)]"><CollaborationHub /></div>}
            {activeTab === "activity"  && <ActivityFeed mobile />}
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/50 flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition-colors",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <Toaster />
    </div>
  );
}
