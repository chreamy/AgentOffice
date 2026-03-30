"use client";

import { useState } from "react";
import {
  useTasks,
  createTask,
  updateTask,
  deleteTask,
  type LiveTask,
} from "@/lib/hooks";

const PRIORITY_STYLE: Record<string, string> = {
  P0: "bg-red-500/20 text-red-400 border-red-500/30",
  P1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  P2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  P3: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUS_STYLE: Record<string, string> = {
  done: "bg-emerald-500/20 text-emerald-400",
  "in-progress": "bg-amber-500/20 text-amber-400",
  review: "bg-blue-500/20 text-blue-400",
  todo: "bg-gray-500/20 text-gray-400",
};

export default function TasksPage() {
  const { data: tasks, loading } = useTasks();
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"P0" | "P1" | "P2" | "P3">("P2");
  const [newAssignee, setNewAssignee] = useState("kiyo");
  const [filter, setFilter] = useState("all");

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    const agentMap: Record<string, string> = {
      kiyo: "Kiyo 🦾", arch: "Arch 🏗️", nova: "Nova ✨",
      atlas: "Atlas 🌐", echo: "Echo 📊",
    };
    await createTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      assignee: agentMap[newAssignee] || newAssignee,
      assigneeId: newAssignee,
      status: "todo",
      progress: 0,
    });
    setNewTitle("");
    setNewDesc("");
    setShowNewTask(false);
  };

  const handleToggle = async (t: LiveTask) => {
    const order = ["todo", "in-progress", "review", "done"] as const;
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    await updateTask(t._id, { status: next, progress: next === "done" ? 100 : undefined });
  };

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Task Command</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage agent tasks — synced via stream
          </p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "To Do", count: tasks.filter((t) => t.status === "todo").length, color: "text-gray-400" },
          { label: "In Progress", count: tasks.filter((t) => t.status === "in-progress").length, color: "text-amber-400" },
          { label: "Review", count: tasks.filter((t) => t.status === "review").length, color: "text-blue-400" },
          { label: "Done", count: tasks.filter((t) => t.status === "done").length, color: "text-emerald-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
          >
            <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>
              {loading ? "—" : s.count}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "todo", "in-progress", "review", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {f === "all" ? "All" : f.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* New task form */}
      {showNewTask && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 space-y-3">
          <h3 className="font-semibold text-sm">Create New Task</h3>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as "P0" | "P1" | "P2" | "P3")}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none"
            >
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Medium</option>
              <option value="P3">P3 - Low</option>
            </select>
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none"
            >
              <option value="kiyo">Kiyo 🦾</option>
              <option value="arch">Arch 🏗️</option>
              <option value="nova">Nova ✨</option>
              <option value="atlas">Atlas 🌐</option>
              <option value="echo">Echo 📊</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewTask(false)}
              className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No tasks found</p>
            <p className="text-xs mt-1">
              {filter !== "all" ? "Try a different filter or " : ""}Create the first task above
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task._id}
              className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(task)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                    task.status === "done"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {task.status === "done" && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`font-medium text-sm ${task.status === "done" ? "line-through text-gray-500" : ""}`}
                    >
                      {task.title}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_STYLE[task.priority] ?? ""}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {task.assignee && (
                      <span className="text-[10px] text-gray-500">
                        👤 {task.assignee}
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[task.status] ?? ""}`}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                    {task.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.status === "in-progress" && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
