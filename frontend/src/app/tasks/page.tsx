"use client";

import { useState } from "react";
import { useTasks, useAgents, createTask, startTask, completeTask, deleteTask } from "@/lib/hooks";
import type { LiveTask } from "@/lib/hooks";

const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500/20 text-red-400 border border-red-500/30",
  P1: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  P2: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  P3: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
};

const AGENTS = ["main", "leads", "it", "finance", "growth"];

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function TaskCard({ task, onStart, onDone, onDelete }: {
  task: LiveTask;
  onStart: (id: string) => void;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3 hover:border-border transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      {task.agentName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{task.agentEmoji}</span>
          <span>{task.agentName}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {task.status === "queued"      && `Queued ${timeAgo(task.queuedAt)}`}
          {task.status === "in-progress" && `Started ${timeAgo(task.startedAt)}`}
          {task.status === "done"        && `Done ${timeAgo(task.completedAt)}`}
        </span>
        {task.dueDate && <span>Due {task.dueDate}</span>}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === "queued" && (
          <button
            onClick={() => onStart(task._id)}
            className="flex-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg py-1.5 transition-colors"
          >
            ▶ Start
          </button>
        )}
        {task.status === "in-progress" && (
          <button
            onClick={() => onDone(task._id)}
            className="flex-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg py-1.5 transition-colors"
          >
            ✓ Complete
          </button>
        )}
        <button
          onClick={() => onDelete(task._id)}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-1.5 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data: tasks, loading } = useTasks();
  const { data: agents } = useAgents();
  const [showNew, setShowNew] = useState(false);
  const [activeAgent, setActiveAgent] = useState("it");
  const [form, setForm] = useState<{ title: string; description: string; priority: "P0"|"P1"|"P2"|"P3"; dueDate: string; agentId: string }>({ title: "", description: "", priority: "P2", dueDate: "", agentId: "" });
  const [submitting, setSubmitting] = useState(false);

  const queued     = tasks.filter(t => t.status === "queued");
  const inProgress = tasks.filter(t => t.status === "in-progress");
  const done       = tasks.filter(t => t.status === "done");

  const handleStart = async (id: string) => {
    await startTask(id, activeAgent);
  };

  const handleDone = async (id: string) => {
    const task = tasks.find(t => t._id === id);
    await completeTask(id, task?.agentId || activeAgent);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    const agent = agents.find(a => a.agentId === form.agentId);
    await createTask({
      ...form,
      agentName: agent?.name || "",
      agentEmoji: agent?.emoji || "",
    });
    setForm({ title: "", description: "", priority: "P2", dueDate: "", agentId: "" });
    setShowNew(false);
    setSubmitting(false);
  };

  const col = (label: string, items: LiveTask[], accent: string, count: number) => (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{count}</span>
        </div>
      </div>
      <div className="space-y-3 min-h-[120px]">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />)
          : items.length === 0
            ? <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border/40 rounded-xl">No tasks</div>
            : items.map(t => (
                <TaskCard key={t._id} task={t} onStart={handleStart} onDone={handleDone} onDelete={handleDelete} />
              ))
        }
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-sm text-muted-foreground">
            {queued.length} queued · {inProgress.length} in progress · {done.length} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Active agent selector */}
          <select
            value={activeAgent}
            onChange={e => setActiveAgent(e.target.value)}
            className="text-xs bg-muted/60 border border-border/50 rounded-lg px-2 py-1.5 text-foreground"
          >
            {(agents.length > 0 ? agents : []).map(a => (
              <option key={a.agentId} value={a.agentId}>{a.emoji} {a.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* New task form */}
      {showNew && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold">Create Task</h3>
          <input
            className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm"
            placeholder="Task title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="bg-muted/40 border border-border/50 rounded-lg px-2 py-2 text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as "P0"|"P1"|"P2"|"P3" })}>
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
              
            </select>
            <select className="bg-muted/40 border border-border/50 rounded-lg px-2 py-2 text-sm" value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.agentId} value={a.agentId}>{a.emoji} {a.name}</option>)}
            </select>
            <input type="date" className="bg-muted/40 border border-border/50 rounded-lg px-2 py-2 text-sm col-span-2 md:col-span-2" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title.trim()} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {submitting ? "Creating…" : "Create Task"}
            </button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex flex-col md:flex-row gap-6">
        {col("Queued",      queued,     "bg-gray-400",   queued.length)}
        {col("In Progress", inProgress, "bg-amber-400",  inProgress.length)}
        {col("Done",        done,       "bg-green-500",  done.length)}
      </div>

      {/* Agent usage tip */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border/30">
        <span className="font-semibold text-foreground">Agents:</span> Use <code className="bg-muted px-1 rounded">bash ~/set_state.sh task:start &lt;taskId&gt;</code> to claim a task and <code className="bg-muted px-1 rounded">task:done &lt;taskId&gt;</code> to complete it. Status auto-updates in the dashboard.
      </div>
    </div>
  );
}
