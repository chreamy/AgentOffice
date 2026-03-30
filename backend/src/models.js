import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ─── Agent Status ───────────────────────────────────────────────────────────
const AgentStatusSchema = new Schema(
  {
    agentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["working", "idle", "researching", "syncing", "error"],
      default: "idle",
    },
    location: { type: String, default: "Unknown" },
    currentTask: { type: String, default: "Available" },
    statusMessage: { type: String, default: "" },
    uptime: { type: String, default: "100%" },
    tasksCompleted: { type: Number, default: 0 },
    responseTime: { type: String, default: "0s" },
    lastSeen: { type: Date, default: Date.now },
    workspace: { type: String, default: "" },
  },
  { timestamps: true }
);

// ─── Tasks ──────────────────────────────────────────────────────────────────
const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["P0", "P1", "P2", "P3"],
      default: "P2",
    },
    assignee: { type: String, default: "" },
    assigneeId: { type: String, default: "" },
    tags: [{ type: String }],
    dueDate: { type: String, default: "" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

// ─── Activity Events ────────────────────────────────────────────────────────
const ActivitySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["success", "warning", "info", "error"],
      default: "info",
    },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    agentEmoji: { type: String, default: "" },
    message: { type: String, required: true },
    metadata: { type: String, default: "" },
    channel: { type: String, default: "general" },
  },
  { timestamps: true }
);

// ─── Messages ───────────────────────────────────────────────────────────────
const MessageSchema = new Schema(
  {
    sender: { type: String, required: true },
    senderId: { type: String, required: true },
    senderEmoji: { type: String, default: "" },
    content: { type: String, required: true },
    channel: { type: String, default: "general" },
    type: { type: String, enum: ["text", "file", "task"], default: "text" },
    fileInfo: { name: String, size: String, url: String },
  },
  { timestamps: true }
);

// ─── Analytics Snapshots ────────────────────────────────────────────────────
const AnalyticsSchema = new Schema(
  {
    date: { type: String, required: true },
    tasksCompleted: { type: Number, default: 0 },
    tasksInProgress: { type: Number, default: 0 },
    tasksFailed: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    apiCallsTotal: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    agentStats: [
      {
        agentId: String,
        tasksCompleted: Number,
        efficiency: Number,
        responseTime: Number,
      },
    ],
  },
  { timestamps: true }
);

// ─── Memory Notes ───────────────────────────────────────────────────────────
const MemorySchema = new Schema(
  {
    agentId: { type: String, required: true },
    date: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    isLongTerm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AgentStatus =
  models.AgentStatus || model("AgentStatus", AgentStatusSchema);
export const Task = models.Task || model("Task", TaskSchema);
export const Activity = models.Activity || model("Activity", ActivitySchema);
export const Message = models.Message || model("Message", MessageSchema);
export const Analytics =
  models.Analytics || model("Analytics", AnalyticsSchema);
export const Memory = models.Memory || model("Memory", MemorySchema);
