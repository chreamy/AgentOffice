"use client";

import { useState, useEffect, useCallback } from "react";

export interface LiveAgent {
  _id: string;
  agentId: string;
  name: string;
  emoji: string;
  role: string;
  status: "working" | "idle" | "researching" | "syncing" | "error";
  location: string;
  currentTask: string;
  statusMessage: string;
  uptime: string;
  tasksCompleted: number;
  responseTime: string;
  lastSeen: string;
  workspace: string;
  workspaceContext?: {
    recentMemory: string;
    longTerm: string;
  };
}

export interface LiveTask {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string;
  assigneeId: string;
  tags: string[];
  dueDate: string;
  progress: number;
  createdAt: string;
}

export interface LiveActivity {
  _id: string;
  type: "success" | "warning" | "info" | "error";
  agentId: string;
  agentName: string;
  agentEmoji: string;
  message: string;
  metadata: string;
  createdAt: string;
}

export interface LiveMessage {
  _id: string;
  sender: string;
  senderId: string;
  senderEmoji: string;
  content: string;
  channel: string;
  type: "text" | "file" | "task";
  createdAt: string;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalActivities: number;
  agentsOnline: number;
  totalAgents: number;
}

// Generic fetcher with polling
function usePoll<T>(url: string, intervalMs = 5000, transform?: (data: unknown) => T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(transform ? transform(json) : json);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [url, transform]);

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, intervalMs);
    return () => clearInterval(interval);
  }, [fetch_, intervalMs]);

  return { data, loading, error, refetch: fetch_ };
}

// ─── Agents ──────────────────────────────────────────────────────────────────
export function useAgents() {
  return usePoll<LiveAgent[]>(
    "/api/agents",
    8000,
    (json: unknown) => (json as { agents: LiveAgent[] }).agents || []
  );
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export function useTasks(status?: string) {
  const url = status && status !== "all" ? `/api/tasks?status=${status}` : "/api/tasks";
  return usePoll<LiveTask[]>(url, 5000, (json: unknown) => (json as { tasks: LiveTask[] }).tasks || []);
}

export async function createTask(data: Partial<LiveTask>) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTask(id: string, data: Partial<LiveTask>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTask(id: string) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  return res.json();
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export function useActivity(limit = 50) {
  return usePoll<LiveActivity[]>(
    `/api/activity?limit=${limit}`,
    4000,
    (json: unknown) => (json as { activities: LiveActivity[] }).activities || []
  );
}

export async function postActivity(data: Partial<LiveActivity>) {
  const res = await fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Messages ────────────────────────────────────────────────────────────────
export function useMessages(channel = "general") {
  return usePoll<LiveMessage[]>(
    `/api/messages?channel=${channel}`,
    3000,
    (json: unknown) => (json as { messages: LiveMessage[] }).messages || []
  );
}

export async function sendMessage(data: Partial<LiveMessage>) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export function useAnalytics(range = "7d") {
  return usePoll<{ summary: AnalyticsSummary; dailyData: unknown[]; agents: LiveAgent[] }>(
    `/api/analytics?range=${range}`,
    10000,
    (json: unknown) => json as { summary: AnalyticsSummary; dailyData: unknown[]; agents: LiveAgent[] }
  );
}

// ─── Update Agent Status ─────────────────────────────────────────────────────
export async function updateAgentStatus(agentId: string, data: Partial<LiveAgent>) {
  const res = await fetch("/api/agents", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, ...data }),
  });
  return res.json();
}
