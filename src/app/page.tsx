"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

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

        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border/50 px-6 py-2 flex-shrink-0">
              <TabsList className="glass">
                <TabsTrigger value="command" className="gap-2">
                  <span>🎯</span>
                  <span className="hidden sm:inline">Command</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="gap-2">
                  <span>🏗️</span>
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <span>📊</span>
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <span>✅</span>
                  <span className="hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="collab" className="gap-2">
                  <span>💬</span>
                  <span className="hidden sm:inline">Collab</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="command" className="mt-0">
                <motion.div {...fadeIn}>
                  <CommandCenter />
                </motion.div>
              </TabsContent>

              <TabsContent value="agents" className="mt-0">
                <motion.div {...fadeIn}>
                  <AgentPresencePanel />
                </motion.div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <motion.div {...fadeIn}>
                  <AnalyticsObservatory />
                </motion.div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <motion.div {...fadeIn}>
                  <TaskCommand />
                </motion.div>
              </TabsContent>

              <TabsContent value="collab" className="mt-0">
                <motion.div {...fadeIn} className="h-[calc(100vh-180px)]">
                  <CollaborationHub />
                </motion.div>
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
