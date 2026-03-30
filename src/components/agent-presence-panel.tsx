"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin, MessageSquare, MoreHorizontal,
  Wifi, WifiOff, Clock, Brain, Code, Search, FileText, BarChart3,
} from "lucide-react";
import { useAgents, updateAgentStatus } from "@/lib/hooks";

const STATUS_COLOR: Record<string, string> = {
  working:    "bg-amber-500",
  idle:       "bg-green-500",
  researching:"bg-blue-500",
  syncing:    "bg-purple-500",
  error:      "bg-red-500",
};

const STATUS_ANIM: Record<string, string> = {
  working: "status-busy",
  idle:    "status-online",
  error:   "status-error",
};

const AGENT_GRADIENT: Record<string, string> = {
  kiyo:  "from-blue-500 to-cyan-500",
  arch:  "from-amber-500 to-orange-500",
  nova:  "from-purple-500 to-pink-500",
  atlas: "from-green-500 to-emerald-500",
  echo:  "from-rose-500 to-red-500",
};

const ZONES = [
  { id: "Command Center",    icon: Brain,    description: "Strategic oversight & coordination" },
  { id: "Engineering Bay",   icon: Code,     description: "Development & infrastructure" },
  { id: "Design Studio",     icon: BarChart3,description: "Creative work & UX design" },
  { id: "Knowledge Library", icon: Search,   description: "Research & documentation" },
  { id: "Analytics Lab",     icon: FileText, description: "Data analysis & reporting" },
];

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function AgentPresencePanel() {
  const { data: agents, loading, refetch } = useAgents();

  const handleStatusCycle = async (agentId: string, current: string) => {
    const statuses = ["idle", "working", "researching", "syncing", "error"];
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
    await updateAgentStatus(agentId, { status: next as never });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Presence</h2>
          <p className="text-muted-foreground">Real-time location and status — live from MongoDB</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Wifi className="w-3 h-3" />
          Live · {agents?.length ?? 0} agents
        </Badge>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="glass">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="zones">Office Map</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* ── GRID ── */}
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                ))
              : agents?.map((agent, index) => (
                  <motion.div
                    key={agent.agentId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Card className="glass card-hover overflow-hidden group">
                      <div className={`h-1.5 bg-gradient-to-r ${AGENT_GRADIENT[agent.agentId] ?? "from-gray-500 to-gray-600"}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${AGENT_GRADIENT[agent.agentId] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-2xl shadow-lg`}>
                                {agent.emoji}
                              </div>
                              <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background cursor-pointer ${STATUS_COLOR[agent.status] ?? "bg-gray-500"} ${STATUS_ANIM[agent.status] ?? ""}`}
                                title="Click to cycle status"
                                onClick={() => handleStatusCycle(agent.agentId, agent.status)}
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{agent.name}</h3>
                              <p className="text-xs text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span>{agent.location}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground line-clamp-2">{agent.currentTask}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold">{agent.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">Tasks</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{agent.uptime}</p>
                            <p className="text-xs text-muted-foreground">Uptime</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{agent.responseTime}</p>
                            <p className="text-xs text-muted-foreground">Avg Resp</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Badge
                            variant="secondary"
                            className={`flex-1 justify-center cursor-pointer ${
                              agent.status === "idle" ? "bg-green-500/20 text-green-500" :
                              agent.status === "working" ? "bg-amber-500/20 text-amber-500" :
                              agent.status === "error" ? "bg-red-500/20 text-red-500" :
                              "bg-blue-500/20 text-blue-500"
                            }`}
                            onClick={() => handleStatusCycle(agent.agentId, agent.status)}
                          >
                            {agent.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="w-3 h-3" />
                            DM
                          </Button>
                        </div>

                        {agent.workspaceContext?.recentMemory && (
                          <div className="mt-3 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground line-clamp-2">
                            📝 {agent.workspaceContext.recentMemory.slice(0, 120)}…
                          </div>
                        )}

                        <p className="mt-2 text-[10px] text-muted-foreground text-right">
                          Last seen {timeAgo(agent.lastSeen)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </TabsContent>

        {/* ── ZONES ── */}
        <TabsContent value="zones" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ZONES.map((zone, index) => {
              const zoneAgents = agents?.filter(a => a.location === zone.id) ?? [];
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="glass h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <zone.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{zone.id}</CardTitle>
                          <p className="text-xs text-muted-foreground">{zone.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {zoneAgents.length > 0 ? (
                        <div className="space-y-3">
                          {zoneAgents.map(agent => (
                            <div key={agent.agentId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <span className="text-2xl">{agent.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{agent.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{agent.currentTask}</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_COLOR[agent.status] ?? "bg-gray-500"} ${STATUS_ANIM[agent.status] ?? ""}`} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No agents here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── LIST ── */}
        <TabsContent value="list" className="mt-6">
          <Card className="glass">
            <ScrollArea className="h-[60vh]">
              <div className="divide-y divide-border/50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                      </div>
                    ))
                  : agents?.map((agent, index) => (
                      <motion.div
                        key={agent.agentId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AGENT_GRADIENT[agent.agentId] ?? "from-gray-500 to-gray-600"} flex items-center justify-center text-lg`}>
                            {agent.emoji}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${STATUS_COLOR[agent.status] ?? "bg-gray-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{agent.name}</span>
                            <Badge variant="outline" className="text-xs">{agent.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{agent.currentTask}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{agent.location}</span>
                          <span>{agent.uptime} uptime</span>
                          <span>{agent.tasksCompleted} tasks</span>
                          <span className="text-xs">{timeAgo(agent.lastSeen)}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
