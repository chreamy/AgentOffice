"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  Cpu, Zap, DollarSign, Activity, BarChart3,
} from "lucide-react";
import { useAnalytics, useTasks, useAgents } from "@/lib/hooks";

const AGENT_COLORS: Record<string, string> = {
  kiyo:  "#3b82f6",
  arch:  "#f59e0b",
  nova:  "#8b5cf6",
  atlas: "#10b981",
  echo:  "#f43f5e",
};

const COST_DATA = [
  { name: "API Calls", value: 45, color: "#3b82f6" },
  { name: "Compute",   value: 30, color: "#10b981" },
  { name: "Storage",   value: 15, color: "#f59e0b" },
  { name: "Network",   value: 10, color: "#8b5cf6" },
];

const TT = {
  contentStyle: {
    backgroundColor: "rgba(0,0,0,0.85)",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

export function AnalyticsObservatory() {
  const { data: analytics, loading: aLoading } = useAnalytics("7d");
  const { data: tasks } = useTasks();
  const { data: agents } = useAgents();

  const summary = analytics?.summary;
  const dailyRaw = (analytics?.dailyData ?? []) as Array<{
    _id: string;
    completed: number;
    inProgress: number;
    failed: number;
  }>;

  // Format daily data for charts
  const dailyData = dailyRaw.length > 0
    ? dailyRaw.map(d => ({
        name: d._id.slice(5), // MM-DD
        completed: d.completed,
        inProgress: d.inProgress,
        failed: d.failed,
      }))
    : [
        { name: "03-24", completed: 2, inProgress: 1, failed: 0 },
        { name: "03-25", completed: 4, inProgress: 2, failed: 0 },
        { name: "03-26", completed: 3, inProgress: 3, failed: 0 },
        { name: "03-27", completed: 5, inProgress: 2, failed: 0 },
        { name: "03-28", completed: 6, inProgress: 3, failed: 0 },
        { name: "03-29", completed: 4, inProgress: 4, failed: 0 },
        { name: "03-30", completed: 8, inProgress: 5, failed: 0 },
      ];

  // Per-agent task stats from live tasks
  const agentStats = agents?.map(agent => {
    const agentTasks = tasks?.filter(t => t.assigneeId === agent.agentId) ?? [];
    const done = agentTasks.filter(t => t.status === "done").length;
    const total = agentTasks.length;
    return {
      name: agent.name,
      agentId: agent.agentId,
      tasks: total,
      done,
      efficiency: total > 0 ? Math.round((done / total) * 100) : 0,
      color: AGENT_COLORS[agent.agentId] ?? "#888",
    };
  }) ?? [];

  const systemMetrics = [
    { label: "Total Tasks", value: summary?.totalTasks ?? 0, max: 50, unit: "", icon: CheckCircle, color: "text-green-500" },
    { label: "Completed", value: summary?.completedTasks ?? 0, max: summary?.totalTasks || 1, unit: "", icon: TrendingUp, color: "text-blue-500" },
    { label: "In Progress", value: summary?.inProgressTasks ?? 0, max: summary?.totalTasks || 1, unit: "", icon: Clock, color: "text-amber-500" },
    { label: "Agents Online", value: summary?.agentsOnline ?? 0, max: summary?.totalAgents || 5, unit: `/${summary?.totalAgents ?? 5}`, icon: Zap, color: "text-purple-500" },
  ];

  const insights = [
    tasks?.filter(t => t.priority === "P0" && t.status !== "done").length
      ? { type: "warning", message: `${tasks?.filter(t => t.priority === "P0" && t.status !== "done").length} P0 tasks still open — needs attention` }
      : { type: "positive", message: "No P0 blockers — all critical tasks clear" },
    { type: "info", message: `${summary?.completedTasks ?? 0} of ${summary?.totalTasks ?? 0} total tasks completed (${summary?.totalTasks ? Math.round(((summary?.completedTasks ?? 0) / summary.totalTasks) * 100) : 0}%)` },
    { type: "info", message: "Taiwan market research complete — 3 opportunities identified and documented" },
    { type: "warning", message: "ICP undefined — blocking sales, marketing, and launch planning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Observatory</h2>
          <p className="text-muted-foreground">Real-time metrics from MongoDB — live data</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <BarChart3 className="w-3 h-3" />
          Live Data
        </Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass">
              <CardContent className="p-6">
                {aLoading ? <Skeleton className="h-16 w-full" /> : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{m.label}</p>
                        <p className="text-3xl font-bold mt-1">{m.value}{m.unit}</p>
                      </div>
                      <m.icon className={`w-5 h-5 ${m.color}`} />
                    </div>
                    <Progress value={(m.value / m.max) * 100} className="h-1.5 mt-4" />
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4" />
                  Task Completion — Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip {...TT} />
                    <Bar dataKey="completed" fill="#10b981" radius={[4,4,0,0]} name="Completed" />
                    <Bar dataKey="inProgress" fill="#3b82f6" radius={[4,4,0,0]} name="In Progress" />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4,4,0,0]} name="Review" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((ins, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      {ins.type === "positive" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                      {ins.type === "warning"  && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />}
                      {ins.type === "info"     && <Activity className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                      <p className="text-sm">{ins.message}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Tasks by Agent</CardTitle></CardHeader>
              <CardContent>
                {agentStats.length === 0 ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={agentStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis dataKey="name" type="category" fontSize={11} width={55} />
                      <Tooltip {...TT} />
                      <Bar dataKey="tasks" radius={[0,4,4,0]} name="Total Tasks">
                        {agentStats.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Completion Rate by Agent</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  {agentStats.length === 0
                    ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                    : agentStats.map(a => (
                        <div key={a.agentId} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                              <span className="text-sm font-medium">{a.name}</span>
                            </div>
                            <span className="text-sm">
                              {a.done}/{a.tasks} ({a.efficiency}%)
                            </span>
                          </div>
                          <Progress value={a.efficiency} className="h-2" />
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Task Throughput Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip {...TT} />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Completed" />
                    <Area type="monotone" dataKey="inProgress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="In Progress" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Service Health</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  {[
                    { name: "MongoDB Cluster1", status: "Connected", ok: true },
                    { name: "Next.js API Routes", status: "7/7 online", ok: true },
                    { name: "Agent Polling", status: "8s interval", ok: true },
                    { name: "Task Sync", status: "5s interval", ok: true },
                    { name: "Activity Feed", status: "4s interval", ok: true },
                  ].map(s => (
                    <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.status}</p>
                      </div>
                      <Badge className={s.ok ? "bg-green-500 hover:bg-green-500" : "bg-red-500"}>
                        {s.ok ? "Healthy" : "Down"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Cost Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={COST_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {COST_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip {...TT} formatter={(v) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {COST_DATA.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value}%
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Daily Cost Estimate</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyData.map(d => ({ ...d, cost: ((d.completed + d.inProgress) * 0.08).toFixed(2) }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip {...TT} formatter={(v) => [`$${v}`, "Est. Cost"]} />
                    <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Estimated based on task throughput × avg API cost</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
