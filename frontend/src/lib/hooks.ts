"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Agent {
  _id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  systemPrompt: string;
  pinned: boolean;
  messageCount: number;
  lastMessage: string;
  lastRole: string | null;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface KimiModel {
  id: string;
  name: string;
  ctx: string;
}

// ─── API helpers ────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  const r = await fetch(`${API}/api/chat/agents`);
  const j = await r.json();
  return j.agents || [];
}

export async function fetchAgent(id: string): Promise<Agent | null> {
  const r = await fetch(`${API}/api/chat/agents/${id}`);
  const j = await r.json();
  return j.agent || null;
}

export async function createAgent(data: Partial<Agent>): Promise<Agent> {
  const r = await fetch(`${API}/api/chat/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json();
  return j.agent;
}

export async function patchAgent(id: string, data: Record<string, unknown>) {
  const r = await fetch(`${API}/api/chat/agents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function deleteAgent(id: string) {
  await fetch(`${API}/api/chat/agents/${id}`, { method: "DELETE" });
}

export async function clearMessages(id: string) {
  await fetch(`${API}/api/chat/agents/${id}/messages`, { method: "DELETE" });
}

export async function fetchModels(): Promise<KimiModel[]> {
  const r = await fetch(`${API}/api/chat/models`);
  const j = await r.json();
  return j.models || [];
}

export function sendMessageStream(
  agentId: string,
  content: string,
  signal?: AbortSignal,
) {
  return fetch(`${API}/api/chat/agents/${agentId}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal,
  });
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchAgents();
    setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { agents, loading, refresh };
}

export function useModels() {
  const [models, setModels] = useState<KimiModel[]>([]);
  useEffect(() => {
    fetchModels().then(setModels);
  }, []);
  return models;
}
