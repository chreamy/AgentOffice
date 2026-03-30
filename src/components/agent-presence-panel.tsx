"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  MessageSquare, 
  Phone, 
  MoreHorizontal,
  Wifi,
  WifiOff,
  Clock,
  Zap,
  Brain,
  Code,
  Search,
  FileText
} from "lucide-react";

const agents = [
  {
    id: "kiyo",
    name: "Kiyo",
    emoji: "🦾",
    role: "CEO & Chief Orchestrator",
    status: "working",
    location: "Command Center",
    currentTask: "Strategic planning & system optimization",
    skills: ["Strategy", "Architecture", "Leadership"],
    uptime: "99.9%",
    tasksCompleted: 247,
    responseTime: "1.2s",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "arch",
    name: "Arch",
    emoji: "🏗️",
    role: "Senior Developer & System Architect",
    status: "working",
    location: "Engineering Bay",
    currentTask: "Building agent office dashboard",
    skills: ["Full-Stack", "DevOps", "Debugging"],
    uptime: "99.8%",
    tasksCompleted: 189,
    responseTime: "0.8s",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "nova",
    name: "Nova",
    emoji: "✨",
    role: "Creative Director & UX Lead",
    status: "idle",
    location: "Design Studio",
    currentTask: "Available for creative tasks",
    skills: ["Design", "UX", "Branding"],
    uptime: "99.5%",
    tasksCompleted: 156,
    responseTime: "1.5s",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "atlas",
    name: "Atlas",
    emoji: "🌐",
    role: "Research Lead & Knowledge Curator",
    status: "researching",
    location: "Library",
    currentTask: "Researching AI tools & trends",
    skills: ["Research", "Analysis", "Documentation"],
    uptime: "99.7%",
    tasksCompleted: 203,
    responseTime: "2.1s",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "echo",
    name: "Echo",
    emoji: "📊",
    role: "Data Analyst & Reporting Specialist",
    status: "syncing",
    location: "Analytics Lab",
    currentTask: "Syncing dashboard metrics",
    skills: ["Analytics", "SQL", "Visualization"],
    uptime: "99.9%",
    tasksCompleted: 312,
    responseTime: "0.9s",
    color: "from-rose-500 to-red-500",
  },
];

const officeZones = [
  { id: "command", name: "Command Center", icon: Brain, agents: ["kiyo"], description: "Strategic oversight & coordination" },
  { id: "engineering", name: "Engineering Bay", icon: Code, agents: ["arch"], description: "Development & infrastructure" },
  { id: "design", name: "Design Studio", icon: Zap, agents: ["nova"], description: "Creative work & UX design" },
  { id: "library", name: "Knowledge Library", icon: Search, agents: ["atlas"], description: "Research & documentation" },
  { id: "analytics", name: "Analytics Lab", icon: FileText, agents: ["echo"], description: "Data analysis & reporting" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "working": return "bg-amber-500";
    case "idle": return "bg-green-500";
    case "researching": return "bg-blue-500";
    case "syncing": return "bg-purple-500";
    case "error": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getStatusAnimation = (status: string) => {
  switch (status) {
    case "working": return "status-busy";
    case "idle": return "status-online";
    case "error": return "status-error";
    default: return "";
  }
};

export function AgentPresencePanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Presence</h2>
          <p className="text-muted-foreground">Real-time location and status of your AI team</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Wifi className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="zones">Office Map</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass card-hover overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${agent.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-lg`}>
                            {agent.emoji}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${getStatusColor(agent.status)} ${getStatusAnimation(agent.status)}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{agent.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{agent.currentTask}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {agent.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
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
                        <p className="text-xs text-muted-foreground">Response</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zones" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeZones.map((zone, index) => {
              const zoneAgents = agents.filter(a => zone.agents.includes(a.id));
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <zone.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{zone.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{zone.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {zoneAgents.length > 0 ? (
                        <div className="space-y-3">
                          {zoneAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="text-2xl">{agent.emoji}</div>
                              <div className="flex-1">
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{agent.currentTask}</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} ${getStatusAnimation(agent.status)}`} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No agents present</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card className="glass">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg`}>
                        {agent.emoji}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(agent.status)} ${getStatusAnimation(agent.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">{agent.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{agent.currentTask}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{agent.location}</span>
                      <span>{agent.uptime} uptime</span>
                      <span>{agent.tasksCompleted} tasks</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
