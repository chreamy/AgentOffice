"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-border/50 px-6 py-2">
              <TabsList className="glass">
                <TabsTrigger value="command" className="gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="hidden sm:inline">Command</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="gap-2">
                  <span className="text-lg">🏗️</span>
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <span className="text-lg">📊</span>
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <span className="text-lg">✅</span>
                  <span className="hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="collab" className="gap-2">
                  <span className="text-lg">💬</span>
                  <span className="hidden sm:inline">Collab</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[calc(100%-60px)] overflow-auto p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="command" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <CommandCenter />
                  </motion.div>
                </TabsContent>

                <TabsContent value="agents" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <AgentPresencePanel />
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <AnalyticsObservatory />
                  </motion.div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <TaskCommand />
                  </motion.div>
                </TabsContent>

                <TabsContent value="collab" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <CollaborationHub />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </main>

        <ActivityFeed />
      </div>
      
      <Toaster />
    </div>
  );
}
