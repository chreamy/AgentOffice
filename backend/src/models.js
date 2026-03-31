import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ─── Tasks (clean schema per spec) ──────────────────────────────────────────
const TaskSchema = new Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["queued", "in-progress", "done"],
      default: "queued",
    },
    priority: {
      type: String,
      enum: ["P0", "P1", "P2", "P3"],
      default: "P2",
    },
    // Agent who claimed / is working on this task
    agentName:   { type: String, default: "" },
    agentId:     { type: String, default: "" },
    agentEmoji:  { type: String, default: "" },
    // Timestamps for lifecycle
    queuedAt:    { type: Date, default: Date.now },
    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
    dueDate:     { type: String, default: "" },
  },
  { timestamps: true }
);

// ─── Activity Events ─────────────────────────────────────────────────────────
const ActivitySchema = new Schema(
  {
    type:       { type: String, enum: ["success", "warning", "info", "error"], default: "info" },
    agentId:    { type: String, required: true },
    agentName:  { type: String, required: true },
    agentEmoji: { type: String, default: "" },
    message:    { type: String, required: true },
    metadata:   { type: String, default: "" },
    taskId:     { type: String, default: "" },
  },
  { timestamps: true }
);

// ─── Messages ─────────────────────────────────────────────────────────────────
const MessageSchema = new Schema(
  {
    sender:      { type: String, required: true },
    senderId:    { type: String, required: true },
    senderEmoji: { type: String, default: "" },
    content:     { type: String, required: true },
    channel:     { type: String, default: "general" },
    type:        { type: String, enum: ["text", "file", "task"], default: "text" },
  },
  { timestamps: true }
);

// ─── Memory Notes ─────────────────────────────────────────────────────────────
const MemorySchema = new Schema(
  {
    agentId:    { type: String, required: true },
    date:       { type: String, required: true },
    content:    { type: String, required: true },
    isLongTerm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Task     = models.Task     || model("Task",     TaskSchema);
export const Activity = models.Activity || model("Activity", ActivitySchema);
export const Message  = models.Message  || model("Message",  MessageSchema);
export const Memory   = models.Memory   || model("Memory",   MemorySchema);
