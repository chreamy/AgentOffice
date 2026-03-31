"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

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
}

export interface LiveTask {
  _id: string;
  title: string;
  description: string;
  status: "queued" | "in-progress" | "done";
  priority: "P0" | "P1" | "P2" | "P3";
  agentName: string;
  agentId: string;
  agentEmoji: string;
  dueDate: string;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
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

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  agentsOnline: number;
  totalAgents: number;
}

// ─── Backend URL ────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Shared SSE Stream ──────────────────────────────────────────────────────

type StreamCallback = (event: string, data: unknown) => void;

let eventSource: EventSource | null = null;
let listeners: Set<StreamCallback> = new Set();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let connectionStatus: "connecting" | "connected" | "disconnected" =
  "disconnected";
let statusListeners: Set<(s: typeof connectionStatus) => void> = new Set();

function setStatus(s: typeof connectionStatus) {
  connectionStatus = s;
  statusListeners.forEach((fn) => fn(s));
}

function connectStream() {
  if (eventSource) return;
  setStatus("connecting");

  const es = new EventSource(`${API}/api/stream`);
  eventSource = es;

  es.addEventListener("connected", () => setStatus("connected"));

  const EVENTS = [
    "agents",
    "tasks",
    "activities",
    "messages",
    "stats",
    "error",
  ];
  EVENTS.forEach((evt) => {
    es.addEventListener(evt, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        listeners.forEach((fn) => fn(evt, data));
      } catch {
        /* ignore parse errors */
      }
    });
  });

  es.onerror = () => {
    setStatus("disconnected");
    es.close();
    eventSource = null;
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (listeners.size > 0) connectStream();
      }, 3000);
    }
  };
}

function subscribe(cb: StreamCallback): () => void {
  listeners.add(cb);
  if (!eventSource) connectStream();
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && eventSource) {
      eventSource.close();
      eventSource = null;
      setStatus("disconnected");
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useConnectionStatus() {
  const [status, setS] = useState<
    "connecting" | "connected" | "disconnected"
  >(connectionStatus);
  useEffect(() => {
    setS(connectionStatus);
    const fn = (s: typeof connectionStatus) => setS(s);
    statusListeners.add(fn);
    const unsub = subscribe(() => {});
    return () => {
      statusListeners.delete(fn);
      unsub();
    };
  }, []);
  return status;
}

function useStream<T>(
  event: string,
  initial: T
): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const gotFirst = useRef(false);

  useEffect(() => {
    const unsub = subscribe((evt, payload) => {
      if (evt === event) {
        setData(payload as T);
        if (!gotFirst.current) {
          gotFirst.current = true;
          setLoading(false);
        }
      }
    });
    return unsub;
  }, [event]);

  return { data, loading };
}

export function useAgents() {
  return useStream<LiveAgent[]>("agents", []);
}

export function useTasks() {
  return useStream<LiveTask[]>("tasks", []);
}

export function useActivity() {
  return useStream<LiveActivity[]>("activities", []);
}

export function useMessages() {
  return useStream<LiveMessage[]>("messages", []);
}

export function useStats() {
  return useStream<DashboardStats>("stats", {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    agentsOnline: 0,
    totalAgents: 0,
  });
}

// ─── Mutations (REST to backend) ────────────────────────────────────────────

export async function updateAgentStatus(
  agentId: string,
  data: Partial<LiveAgent>
) {
  const res = await fetch(`${API}/api/agents`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, ...data }),
  });
  return res.json();
}

export async function createTask(data: Partial<LiveTask>) {
  const res = await fetch(`${API}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTask(id: string, data: Partial<LiveTask>) {
  const res = await fetch(`${API}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function startTask(id: string, agentId: string) {
  const res = await fetch(`${API}/api/tasks/${id}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  return res.json();
}

export async function completeTask(id: string, agentId: string) {
  const res = await fetch(`${API}/api/tasks/${id}/done`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  return res.json();
}

export async function deleteTask(id: string) {
  const res = await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
  return res.json();
}

export async function postActivity(data: Partial<LiveActivity>) {
  const res = await fetch(`${API}/api/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendMessage(data: Partial<LiveMessage>) {
  const res = await fetch(`${API}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
