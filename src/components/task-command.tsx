"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, Calendar, Clock, CheckCircle2, Circle,
  AlertCircle, ArrowUpCircle, User, Tag, Trash2, Edit,
} from "lucide-react";
import { useTasks, createTask, updateTask, deleteTask } from "@/lib/hooks";

const agents = ["Kiyo 🦾", "Arch 🏗️", "Nova ✨", "Atlas 🌐", "Echo 📊"];

const AGENT_IDS: Record<string, string> = {
  "Kiyo 🦾": "kiyo",
  "Arch 🏗️": "arch",
  "Nova ✨": "nova",
  "Atlas 🌐": "atlas",
  "Echo 📊": "echo",
};

const getPriorityColor = (p: string) => {
  switch (p) {
    case "P0": return "bg-red-500/20 text-red-500 border-red-500/50";
    case "P1": return "bg-amber-500/20 text-amber-500 border-amber-500/50";
    case "P2": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default:   return "bg-gray-500/20 text-gray-500 border-gray-500/50";
  }
};

const getStatusIcon = (s: string) => {
  switch (s) {
    case "done":        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "in-progress": return <Clock className="w-4 h-4 text-amber-500" />;
    case "review":      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    default:            return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (s: string) => {
  switch (s) {
    case "done":        return "bg-green-500/20 text-green-500";
    case "in-progress": return "bg-amber-500/20 text-amber-500";
    case "review":      return "bg-blue-500/20 text-blue-500";
    default:            return "bg-gray-500/20 text-gray-500";
  }
};

export function TaskCommand() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string; description: string; priority: "P0" | "P1" | "P2" | "P3";
    assignee: string; tags: string[]; dueDate: string;
  }>({
    title: "", description: "", priority: "P2",
    assignee: agents[0], tags: [], dueDate: "",
  });

  const { data: tasks, loading, refetch } = useTasks();

  const filteredTasks = (tasks ?? []).filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    todo:       (tasks ?? []).filter(t => t.status === "todo").length,
    inProgress: (tasks ?? []).filter(t => t.status === "in-progress").length,
    review:     (tasks ?? []).filter(t => t.status === "review").length,
    done:       (tasks ?? []).filter(t => t.status === "done").length,
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    await createTask({
      ...newTask,
      assigneeId: AGENT_IDS[newTask.assignee] || "",
      status: "todo",
      progress: 0,
    });
    setIsNewTaskOpen(false);
    setNewTask({ title: "", description: "", priority: "P2", assignee: agents[0], tags: [], dueDate: "" });
    refetch();
  };

  const handleToggle = async (taskId: string, currentStatus: string) => {
    const statuses = ["todo", "in-progress", "review", "done"];
    const next = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    await updateTask(taskId, { status: next as "todo" | "in-progress" | "review" | "done", progress: next === "done" ? 100 : undefined });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Command</h2>
          <p className="text-muted-foreground">Manage and track agent tasks — synced to MongoDB</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />New Task
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Task description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v as "P0"|"P1"|"P2"|"P3" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Select value={newTask.assignee} onValueChange={v => setNewTask({ ...newTask, assignee: v || agents[0] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agents.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
              <Button onClick={handleAddTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "To Do", value: stats.todo, icon: Circle, color: "text-muted-foreground" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-500" },
          { label: "In Review", value: stats.review, icon: AlertCircle, color: "text-blue-500" },
          { label: "Completed", value: stats.done, icon: CheckCircle2, color: "text-green-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="glass">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <Icon className={`w-8 h-8 ${color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
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

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">Create the first task to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="glass card-hover group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.status === "done"}
                        onCheckedChange={() => handleToggle(task._id, task.status)}
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
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            <ArrowUpCircle className="w-3 h-3 mr-1" />{task.priority}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {task.assignee && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />{task.assignee}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />{task.dueDate}
                            </div>
                          )}
                          <Badge variant="secondary" className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace("-", " ")}</span>
                          </Badge>
                          {task.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />{tag}
                            </Badge>
                          ))}
                        </div>
                        {task.status === "in-progress" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(task._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
