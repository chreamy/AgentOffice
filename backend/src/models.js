import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ─── Chat Messages (shared sub-schema) ──────────────────────────────────────
const ChatMessageSchema = new Schema({
  role:    { type: String, enum: ["system", "user", "assistant"], required: true },
  content: { type: String, required: true },
  thinking:    { type: String, default: "" },
  tokensIn:    { type: Number, default: 0 },
  tokensOut:   { type: Number, default: 0 },
  responseMs:  { type: Number, default: 0 },
}, { _id: false, timestamps: true });

// ─── Agents (= chat personas with conversations) ───────────────────────────
const AgentSchema = new Schema(
  {
    name:         { type: String, default: "New Agent" },
    emoji:        { type: String, default: "🤖" },
    role:         { type: String, default: "Assistant" },
    // Model config
    provider:     { type: String, default: "moonshot" },
    model:        { type: String, default: "kimi-k2.5" },
    // Persona / system
    systemPrompt: { type: String, default: "" },
    soul:         { type: String, default: "" },
    identity:     { type: String, default: "" },
    // Memory
    memory:       { type: String, default: "" },
    memoryNotes:  [{ date: String, content: String }],
    // Status
    pinned:       { type: Boolean, default: false },
    lastActive:   { type: Date, default: Date.now },
    totalTokensIn:  { type: Number, default: 0 },
    totalTokensOut: { type: Number, default: 0 },
    totalMessages:  { type: Number, default: 0 },
    totalCost:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Conversations (multiple per agent) ─────────────────────────────────────
const ConversationSchema = new Schema(
  {
    agentId:  { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    title:    { type: String, default: "New Conversation" },
    messages: [ChatMessageSchema],
    pinned:   { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    // Analytics per conversation
    tokensIn:   { type: Number, default: 0 },
    tokensOut:  { type: Number, default: 0 },
    cost:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Provider Config (user-configured LLM providers) ────────────────────────
const ProviderSchema = new Schema(
  {
    name:     { type: String, required: true, unique: true },
    label:    { type: String, default: "" },
    baseUrl:  { type: String, required: true },
    apiKey:   { type: String, default: "" },
    models:   [{ id: String, name: String, ctx: String }],
    enabled:  { type: Boolean, default: true },
    // Failover
    cooldownUntil: { type: Date, default: null },
    failCount:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Agent        = models.Agent        || model("Agent",        AgentSchema);
export const Conversation = models.Conversation || model("Conversation", ConversationSchema);
export const Provider     = models.Provider     || model("Provider",     ProviderSchema);
