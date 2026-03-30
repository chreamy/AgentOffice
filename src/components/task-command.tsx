"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUpCircle,
  User,
  Tag,
  Trash2,
  Edit,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string;
  tags: string[];
  dueDate: string;
  progress: number;
  createdAt: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Build Agent Office Dashboard",
    description: "Create a sophisticated Next.js office UI for agent collaboration",
    status: "in-progress",
    priority: "P0",
    assignee: "Arch 🏗️",
    tags: ["frontend", "ui/ux", "high-priority"],
    dueDate: "2026-03-30",
    progress: 65,
    createdAt: "2026-03-29",
  },
  {
    id: "2",
    title: "Research AI Tool Landscape",
    description: "Analyze latest AI capabilities and monetization opportunities",
    status: "in-progress",
    priority: "P1",
    assignee: "Atlas 🌐",
    tags: ["research", "strategy"],
    dueDate: "2026-04-02",
    progress: 40,
    createdAt: "2026-03-28",
  },
  {
    id: "3",
    title: "Design Agent Avatars",
    description: "Create unique visual identities for each agent",
    status: "todo",
    priority: "P2",
    assignee: "Nova ✨",
    tags: ["design", "branding"],
    dueDate: "2026-04-05",
    progress: 0,
    createdAt: "2026-03-29",
  },
  {
    id: "4",
    title: "Set up Analytics Pipeline",
    description: "Implement tracking for agent performance metrics",
    status: "todo",
    priority: "P1",
    assignee: "Echo 📊",
    tags: ["analytics", "backend"],
    dueDate: "2026-04-01",
    progress: 10,
    createdAt: "2026-03-27",
  },
  {
    id: "5",
    title: "Strategic Planning Session",
    description: "Define Q2 objectives and resource allocation",
    status: "done",
    priority: "P0",
    assignee: "Kiyo 🦾",
    tags: ["strategy", "planning"],
    dueDate: "2026-03-28",
    progress: 100,
    createdAt: "2026-03-25",
  },
  {
    id: "6",
    title: "Fix WebSocket Connection Issues",
    description: "Debug intermittent connection drops in agent presence system",
    status: "review",
    priority: "P0",
    assignee: "Arch 🏗️",
    tags: ["bug", "backend", "urgent"],
    dueDate: "2026-03-29",
    progress: 90,
    createdAt: "2026-03-28",
  },
  {
    id: "7",
    title: "Create Weekly Report Template",
    description: "Design automated report generation for stakeholder updates",
    status: "todo",
    priority: "P2",
    assignee: "Echo 📊",
    tags: ["reporting", "automation"],
    dueDate: "2026-04-03",
    progress: 0,
    createdAt: "2026-03-29",
  },
  {
    id: "8",
    title: "Evaluate New LLM Providers",
    description: "Compare pricing and performance of GPT-4, Claude, and Gemini",
    status: "in-progress",
    priority: "P1",
    assignee: "Atlas 🌐",
    tags: ["research", "cost-optimization"],
    dueDate: "2026-04-04",
    progress: 55,
    createdAt: "2026-03-26",
  },
];

const agents = ["Kiyo 🦾", "Arch 🏗️", "Nova ✨", "Atlas 🌐", "Echo 📊"];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "P0": return "bg-red-500/20 text-red-500 border-red-500/50";
    case "P1": return "bg-amber-500/20 text-amber-500 border-amber-500/50";
    case "P2": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    case "P3": return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    default: return "";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "in-progress": return <Clock className="w-4 h-4 text-amber-500" />;
    case "review": return <AlertCircle className="w-4 h-4 text-blue-500" />;
    default: return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "done": return "bg-green-500/20 text-green-500";
    case "in-progress": return "bg-amber-500/20 text-amber-500";
    case "review": return "bg-blue-500/20 text-blue-500";
    default: return "bg-gray-500/20 text-gray-500";
  }
};

export function TaskCommand() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "P2",
    assignee: agents[0],
    tags: [],
    dueDate: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || "",
      status: "todo",
      priority: newTask.priority as Task["priority"],
      assignee: newTask.assignee || agents[0],
      tags: newTask.tags || [],
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      progress: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    setTasks([...tasks, task]);
    setIsNewTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "P2",
      assignee: agents[0],
      tags: [],
      dueDate: "",
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statuses: Task["status"][] = ["todo", "in-progress", "review", "done"];
        const currentIndex = statuses.indexOf(task.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...task, status: nextStatus, progress: nextStatus === "done" ? 100 : task.progress };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Command</h2>
          <p className="text-muted-foreground">Manage and track agent tasks</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P0">P0 - Critical</SelectItem>
                      <SelectItem value="P1">P1 - High</SelectItem>
                      <SelectItem value="P2">P2 - Medium</SelectItem>
                      <SelectItem value="P3">P3 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assignee</label>
                  <Select
                    value={newTask.assignee}
                    onValueChange={(value) => setNewTask({ ...newTask, assignee: value || agents[0] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.todo}</p>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
            <Circle className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.review}</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.done}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="glass">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass card-hover group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            <ArrowUpCircle className="w-3 h-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {task.assignee}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {task.dueDate}
                        </div>
                        <Badge variant="secondary" className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace("-", " ")}</span>
                        </Badge>
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {task.status === "in-progress" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
