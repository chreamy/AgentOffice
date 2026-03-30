"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  Brain
} from "lucide-react";

const stats = [
  { 
    label: "Active Tasks", 
    value: 12, 
    change: "+3 today", 
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  { 
    label: "In Progress", 
    value: 5, 
    change: "2 completing soon", 
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    label: "Avg Response", 
    value: "2.3s", 
    change: "-0.5s vs yesterday", 
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  { 
    label: "Agents Online", 
    value: "5/5", 
    change: "All systems green", 
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
];

const recentActivity = [
  { agent: "Kiyo", action: "Completed market analysis", time: "2m ago", type: "success" },
  { agent: "Arch", action: "Started server migration", time: "5m ago", type: "info" },
  { agent: "Nova", action: "Fixed bug in auth module", time: "12m ago", type: "success" },
  { agent: "Atlas", action: "Researching new tools", time: "18m ago", type: "info" },
  { agent: "Echo", action: "Generated weekly report", time: "25m ago", type: "success" },
];

const agentStatuses = [
  { name: "Kiyo 🦾", role: "CEO & Orchestrator", status: "working", task: "Strategic planning", progress: 75 },
  { name: "Arch 🏗️", role: "Senior Developer", status: "working", task: "System architecture", progress: 45 },
  { name: "Nova ✨", role: "Creative Director", status: "idle", task: "Waiting for input", progress: 0 },
  { name: "Atlas 🌐", role: "Research Lead", status: "researching", task: "Tech stack evaluation", progress: 60 },
  { name: "Echo 📊", role: "Data Analyst", status: "syncing", task: "Updating dashboards", progress: 90 },
];

export function CommandCenter() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8"
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Agent Office</h2>
          <p className="text-white/80 max-w-2xl">
            Your AI team is working in sync. 5 agents online, 12 active tasks, and all systems operational.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-hover glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Panel */}
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentStatuses.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                      {agent.name.split(" ")[1]}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${
                      agent.status === "working" ? "bg-amber-500 status-busy" :
                      agent.status === "idle" ? "bg-green-500 status-online" :
                      agent.status === "researching" ? "bg-blue-500" :
                      "bg-purple-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{agent.name}</span>
                      <Badge variant="secondary" className="text-xs">{agent.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{agent.task}</p>
                    <div className="mt-2">
                      <Progress value={agent.progress} className="h-1.5" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={agent.status === "idle" ? "default" : "secondary"}>
                      {agent.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${
                    activity.type === "success" ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.agent}</span>
                      {" "}{activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass card-hover cursor-pointer group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Deep dive into performance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass card-hover cursor-pointer group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Review Alerts</h3>
              <p className="text-sm text-muted-foreground">3 items need attention</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass card-hover cursor-pointer group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Team Settings</h3>
              <p className="text-sm text-muted-foreground">Manage agent configs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
