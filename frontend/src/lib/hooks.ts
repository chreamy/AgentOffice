"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  thinking?: string;
  tokensIn?: number;
  tokensOut?: number;
  responseMs?: number;
  createdAt?: string;
}

export interface Agent {
  _id: string;
  name: string;
  emoji: string;
  role: string;
  provider: string;
  model: string;
  systemPrompt: string;
  soul: string;
  identity: string;
  memory: string;
  memoryNotes: { date: string; content: string }[];
  pinned: boolean;
  lastActive: string;
  totalTokensIn: number;
  totalTokensOut: number;
  totalMessages: number;
  totalCost: number;
  conversationCount: number;
  totalMessagesCount?: number;
  lastMessage: string;
  lastRole: string | null;
  lastConvoTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConvoSummary {
  _id: string;
  agentId: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  messageCount: number;
  lastMessage: string;
  lastRole: string | null;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  ctx: string;
  provider: string;
  providerLabel: string;
  hasKey: boolean;
}

export interface ProviderInfo {
  _id: string;
  name: string;
  label: string;
  baseUrl: string;
  apiKey: string;
  hasKey: boolean;
  models: { id: string; name: string; ctx: string }[];
  enabled: boolean;
}

export interface Analytics {
  agents: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalMessages: number;
  totalCost: number;
  perAgent: {
    _id: string;
    name: string;
    emoji: string;
    tokensIn: number;
    tokensOut: number;
    messages: number;
    cost: number;
    lastActive: string;
  }[];
}

export const DEFAULT_MODELS: ModelInfo[] = [
  { id: "kimi-k2.5", name: "Kimi K2.5", ctx: "256k", provider: "moonshot", providerLabel: "Moonshot AI", hasKey: false },
  { id: "moonshot-v1-128k", name: "Moonshot v1 128k", ctx: "128k", provider: "moonshot", providerLabel: "Moonshot AI", hasKey: false },
  { id: "gpt-4o", name: "GPT-4o", ctx: "128k", provider: "openai", providerLabel: "OpenAI", hasKey: false },
  { id: "deepseek-chat", name: "DeepSeek V3", ctx: "64k", provider: "deepseek", providerLabel: "DeepSeek", hasKey: false },
];

// ─── API helpers ────────────────────────────────────────────────────────────

async function api(path: string, opts?: RequestInit) {
  const r = await fetch(`${API}/api/chat${path}`, opts);
  return r.json();
}

function post(path: string, body: unknown) {
  return api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function patch(path: string, body: unknown) {
  return api(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function del(path: string) {
  return api(path, { method: "DELETE" });
}

// Agents
export const fetchAgents = () => api("/agents").then((r) => r.agents || []);
export const fetchAgent = (id: string) => api(`/agents/${id}`).then((r) => r.agent || null);
export const createAgent = (data: Partial<Agent>) => post("/agents", data).then((r) => r.agent);
export const patchAgent = (id: string, data: Record<string, unknown>) => patch(`/agents/${id}`, data);
export const deleteAgent = (id: string) => del(`/agents/${id}`);
export const exportAgent = (id: string) => api(`/agents/${id}/export`).then((r) => r.agent);
export const importAgent = (config: unknown) => post("/agents/import", { agent: config }).then((r) => r.agent);

// Memory
export const fetchMemory = (id: string) => api(`/agents/${id}/memory`);
export const addMemoryNote = (id: string, content: string) => post(`/agents/${id}/memory`, { content });

// Conversations
export const fetchConversations = (agentId: string): Promise<ConvoSummary[]> =>
  api(`/agents/${agentId}/conversations`).then((r) => r.conversations || []);
export const createConversation = (agentId: string, title?: string) =>
  post(`/agents/${agentId}/conversations`, { title }).then((r) => r.conversation);
export const fetchConversation = (id: string): Promise<Conversation | null> =>
  api(`/conversations/${id}`).then((r) => r.conversation || null);
export const patchConversation = (id: string, data: Record<string, unknown>) =>
  patch(`/conversations/${id}`, data);
export const deleteConversation = (id: string) => del(`/conversations/${id}`);
export const clearConvoMessages = (id: string) => del(`/conversations/${id}/messages`);

// Models & Providers
export const fetchModels = (): Promise<ModelInfo[]> => api("/models").then((r) => r.models || []);
export const fetchProviders = (): Promise<ProviderInfo[]> => api("/providers").then((r) => r.providers || []);
export const patchProvider = (name: string, data: Record<string, unknown>) => patch(`/providers/${name}`, data);

// Analytics
export const fetchAnalytics = (): Promise<Analytics> => api("/analytics");

// Send (streaming)
export function sendMessageStream(convoId: string, content: string, signal?: AbortSignal) {
  return fetch(`${API}/api/chat/conversations/${convoId}/send`, {
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
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { agents, loading, refresh };
}

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  useEffect(() => {
    fetchModels().then((m) => { if (m.length > 0) setModels(m); }).catch(() => {});
  }, []);
  return models;
}

export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const refresh = useCallback(async () => {
    try { setProviders(await fetchProviders()); } catch {}
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { providers, refresh };
}

export function useConversations(agentId: string | null) {
  const [convos, setConvos] = useState<ConvoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!agentId) { setConvos([]); return; }
    setLoading(true);
    try { setConvos(await fetchConversations(agentId)); } catch {}
    setLoading(false);
  }, [agentId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { convos, loading, refresh };
}

export function useAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const refresh = useCallback(async () => {
    try { setData(await fetchAnalytics()); } catch {}
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, refresh };
}
