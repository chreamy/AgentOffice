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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("command");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="border-b border-border/50 px-6 py-2 flex-shrink-0">
              <TabsList>
                <TabsTrigger value="command">🎯 <span className="hidden sm:inline ml-1">Command</span></TabsTrigger>
                <TabsTrigger value="agents">🏗️ <span className="hidden sm:inline ml-1">Agents</span></TabsTrigger>
                <TabsTrigger value="analytics">📊 <span className="hidden sm:inline ml-1">Analytics</span></TabsTrigger>
                <TabsTrigger value="tasks">✅ <span className="hidden sm:inline ml-1">Tasks</span></TabsTrigger>
                <TabsTrigger value="collab">💬 <span className="hidden sm:inline ml-1">Collab</span></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="command" className="mt-0 p-6">
                <CommandCenter />
              </TabsContent>
              <TabsContent value="agents" className="mt-0 p-6">
                <AgentPresencePanel />
              </TabsContent>
              <TabsContent value="analytics" className="mt-0 p-6">
                <AnalyticsObservatory />
              </TabsContent>
              <TabsContent value="tasks" className="mt-0 p-6">
                <TaskCommand />
              </TabsContent>
              <TabsContent value="collab" className="mt-0 p-6 h-[calc(100vh-140px)]">
                <CollaborationHub />
              </TabsContent>
            </div>
          </Tabs>
        </main>

        <ActivityFeed />
      </div>

      <Toaster />
    </div>
  );
}
