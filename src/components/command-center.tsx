"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Zap, Users, Brain,
} from "lucide-react";
import { useAgents, useTasks, useActivity } from "@/lib/hooks";

const getStatusColor = (s: string) => ({
  working: "bg-amber-500", idle: "bg-green-500",
  researching: "bg-blue-500", syncing: "bg-purple-500", error: "bg-red-500",
}[s] ?? "bg-gray-500");

const getStatusAnim = (s: string) => ({
  working: "status-busy", idle: "status-online", error: "status-error",
}[s] ?? "");

export function CommandCenter() {
  const { data: agents, loading: agentsLoading } = useAgents();
  const { data: tasks } = useTasks();
  const { data: activities } = useActivity(5);

  const activeAgents   = agents?.filter(a => a.status !== "idle").length ?? 0;
  const totalAgents    = agents?.length ?? 5;
  const completedTasks = tasks?.filter(t => t.status === "done").length ?? 0;
  const activeTasks    = tasks?.filter(t => t.status === "in-progress").length ?? 0;
  const p0Tasks        = tasks?.filter(t => t.priority === "P0" && t.status !== "done").length ?? 0;

  const stats = [
    { label: "Active Tasks", value: activeTasks, sub: `${completedTasks} completed`, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "In Progress",  value: activeTasks, sub: "Across agents",              icon: Activity,     color: "text-blue-500",  bg: "bg-blue-500/10"  },
    { label: "Agents Online",value: `${activeAgents}/${totalAgents}`, sub: activeAgents === totalAgents ? "All green" : `${totalAgents - activeAgents} idle`, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "P0 Open",      value: p0Tasks,     sub: p0Tasks ? "Needs attention" : "All clear",       icon: Zap,          color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-5 md:p-8">
        <div className="relative z-10">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Agent Office</h2>
          <p className="text-white/80 text-sm md:text-base">
            {agentsLoading
              ? "Connecting…"
              : `${totalAgents} agents · ${activeTasks} active · ${completedTasks} done`}
          </p>
        </div>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      {/* Stats - 2 col on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-0.5">{s.value}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">{s.sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${s.bg} flex-shrink-0`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agent Activity + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4" />
              Agent Activity
              <Badge variant="secondary" className="ml-auto text-xs">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agentsLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
              : agents?.map((agent, i) => (
                  <motion.div
                    key={agent.agentId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                        {agent.emoji}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${getStatusColor(agent.status)} ${getStatusAnim(agent.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{agent.name}</span>
                        <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">{agent.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{agent.currentTask}</p>
                      <Progress
                        value={agent.status === "idle" ? 0 : agent.status === "syncing" ? 80 : 50}
                        className="h-1 mt-1.5"
                      />
                    </div>
                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                      agent.status === "idle"    ? "border-green-500/50 text-green-500" :
                      agent.status === "working" ? "border-amber-500/50 text-amber-500" :
                      "border-blue-500/50 text-blue-500"
                    }`}>
                      {agent.status}
                    </Badge>
                  </motion.div>
                ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activities || activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((a, i) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      a.type === "success" ? "bg-green-500" :
                      a.type === "error"   ? "bg-red-500" :
                      a.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{a.agentEmoji} {a.agentName}</span>
                        {" "}{a.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, label: "View Analytics", sub: "Performance deep-dive",   color: "text-blue-500",  bg: "bg-blue-500/10"  },
          { icon: AlertCircle,label: "Review Alerts",  sub: `${p0Tasks} P0 open`,      color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Users,      label: "Team Stats",     sub: `${completedTasks} done`,  color: "text-purple-500",bg: "bg-purple-500/10"},
        ].map(({ icon: Icon, label, sub, color, bg }) => (
          <Card key={label} className="glass card-hover cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{label}</h3>
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
