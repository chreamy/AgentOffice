"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAgents, useTasks, useActivity } from "@/lib/hooks";

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

const getStatusAnim = (status: string) => {
  switch (status) {
    case "working": return "status-busy";
    case "idle": return "status-online";
    case "error": return "status-error";
    default: return "";
  }
};

export function CommandCenter() {
  const { data: agents, loading: agentsLoading } = useAgents();
  const { data: tasks } = useTasks();
  const { data: activities } = useActivity(5);

  const activeAgents = agents?.filter(a => a.status !== "idle").length ?? 0;
  const totalAgents = agents?.length ?? 0;
  const completedTasks = tasks?.filter(t => t.status === "done").length ?? 0;
  const activeTasks = tasks?.filter(t => t.status === "in-progress").length ?? 0;

  const stats = [
    { 
      label: "Active Tasks", 
      value: activeTasks, 
      change: `${completedTasks} completed total`, 
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      label: "In Progress", 
      value: activeTasks, 
      change: "Across all agents", 
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Avg Response", 
      value: "2.3s", 
      change: "Live metric", 
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      label: "Agents Online", 
      value: `${activeAgents}/${totalAgents}`, 
      change: activeAgents === totalAgents ? "All systems green" : `${totalAgents - activeAgents} idle`, 
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
  ];

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
            {agentsLoading
              ? "Connecting to MongoDB..."
              : `${totalAgents} agents connected · ${activeTasks} active tasks · ${completedTasks} completed`}
          </p>
        </div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
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
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))
                : agents?.map((agent, index) => (
                    <motion.div
                      key={agent.agentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                          {agent.emoji}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(agent.status)} ${getStatusAnim(agent.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{agent.name} {agent.emoji}</span>
                          <Badge variant="secondary" className="text-xs">{agent.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{agent.currentTask}</p>
                        <div className="mt-1.5">
                          <Progress value={agent.status === "idle" ? 0 : agent.status === "syncing" ? 80 : 50} className="h-1.5" />
                        </div>
                      </div>
                      <Badge variant={agent.status === "idle" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
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
            {!activities || activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">Events from agents will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      activity.type === "success" ? "bg-green-500" : 
                      activity.type === "error" ? "bg-red-500" :
                      activity.type === "warning" ? "bg-amber-500" :
                      "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.agentEmoji} {activity.agentName}</span>
                        {" "}{activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
              <p className="text-sm text-muted-foreground">
                {tasks?.filter(t => t.priority === "P0").length ?? 0} P0 tasks need attention
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass card-hover cursor-pointer group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Team Stats</h3>
              <p className="text-sm text-muted-foreground">{completedTasks} tasks completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
