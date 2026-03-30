"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Zap,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";

const taskData = [
  { name: "Mon", completed: 45, inProgress: 12, failed: 3 },
  { name: "Tue", completed: 52, inProgress: 15, failed: 2 },
  { name: "Wed", completed: 48, inProgress: 18, failed: 4 },
  { name: "Thu", completed: 61, inProgress: 14, failed: 1 },
  { name: "Fri", completed: 55, inProgress: 16, failed: 2 },
  { name: "Sat", completed: 38, inProgress: 8, failed: 1 },
  { name: "Sun", completed: 42, inProgress: 10, failed: 0 },
];

const agentPerformance = [
  { name: "Kiyo", tasks: 247, efficiency: 94, color: "#3b82f6" },
  { name: "Arch", tasks: 189, efficiency: 91, color: "#f59e0b" },
  { name: "Nova", tasks: 156, efficiency: 88, color: "#8b5cf6" },
  { name: "Atlas", tasks: 203, efficiency: 89, color: "#10b981" },
  { name: "Echo", tasks: 312, efficiency: 96, color: "#f43f5e" },
];

const responseTimeData = [
  { time: "00:00", avg: 1.2, peak: 2.1 },
  { time: "04:00", avg: 0.8, peak: 1.5 },
  { time: "08:00", avg: 1.5, peak: 2.8 },
  { time: "12:00", avg: 2.1, peak: 3.5 },
  { time: "16:00", avg: 1.8, peak: 2.9 },
  { time: "20:00", avg: 1.4, peak: 2.3 },
];

const costBreakdown = [
  { name: "API Calls", value: 45, color: "#3b82f6" },
  { name: "Compute", value: 30, color: "#10b981" },
  { name: "Storage", value: 15, color: "#f59e0b" },
  { name: "Network", value: 10, color: "#8b5cf6" },
];

const systemMetrics = [
  { label: "CPU Usage", value: 42, max: 100, unit: "%", icon: Cpu, color: "text-blue-500" },
  { label: "Memory", value: 6.8, max: 16, unit: "GB", icon: Zap, color: "text-amber-500" },
  { label: "API Calls/hr", value: 2847, max: 5000, unit: "", icon: Activity, color: "text-green-500" },
  { label: "Cost Today", value: 12.45, max: 50, unit: "$", icon: DollarSign, color: "text-purple-500" },
];

const insights = [
  { type: "positive", message: "Echo has 96% efficiency - highest this week" },
  { type: "warning", message: "Response times peak during 12:00-14:00" },
  { type: "positive", message: "Zero task failures in last 24 hours" },
  { type: "info", message: "API usage trending down 15% vs last week" },
];

export function AnalyticsObservatory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Observatory</h2>
          <p className="text-muted-foreground">Real-time metrics and performance insights</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <BarChart3 className="w-3 h-3" />
          Live Data
        </Badge>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {metric.unit}{metric.value}
                    </p>
                  </div>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(metric.value / metric.max) * 100} 
                    className="h-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Trends */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Task Completion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="time" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avg" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="peak" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/50"
                  >
                    {insight.type === "positive" && (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    )}
                    {insight.type === "warning" && (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    )}
                    {insight.type === "info" && (
                      <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <p className="text-sm">{insight.message}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Tasks Completed by Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                      {agentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Efficiency Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentPerformance.map((agent) => (
                    <div key={agent.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: agent.color }}
                          />
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <span className="text-sm font-bold">{agent.efficiency}%</span>
                      </div>
                      <Progress value={agent.efficiency} className="h-2" />
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
              <CardHeader>
                <CardTitle className="text-lg">API Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="time" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">System Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "WebSocket Server", status: "Healthy", uptime: "99.9%" },
                    { name: "Database", status: "Healthy", uptime: "99.99%" },
                    { name: "API Gateway", status: "Healthy", uptime: "99.95%" },
                    { name: "Cache Layer", status: "Healthy", uptime: "100%" },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        {service.status}
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
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {costBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Daily Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={taskData.map(d => ({ ...d, cost: d.completed * 0.05 + d.inProgress * 0.03 }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        border: "none",
                        borderRadius: "8px"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
