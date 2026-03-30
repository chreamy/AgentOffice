"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send, Phone, Video, MoreHorizontal, Paperclip, Smile,
  Users, Hash, Search, Plus, MessageSquare, FileText, Clock,
} from "lucide-react";
import { useMessages, sendMessage, useAgents } from "@/lib/hooks";

interface ChannelDef {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
}

const CHANNELS: ChannelDef[] = [
  { id: "general", name: "general", type: "public" },
  { id: "engineering", name: "engineering", type: "public" },
  { id: "strategy", name: "strategy", type: "private" },
  { id: "random", name: "random", type: "public" },
];

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CollaborationHub() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, loading, refetch } = useMessages(activeChannel);
  const { data: agents } = useAgents();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || sending) return;
    setSending(true);
    await sendMessage({
      sender: "Arch",
      senderId: "arch",
      senderEmoji: "🏗️",
      content,
      channel: activeChannel,
      type: "text",
    });
    setMessageInput("");
    setSending(false);
    refetch();
  };

  return (
    <div className="h-full flex gap-6">
      {/* Channel Sidebar */}
      <Card className="w-64 glass flex flex-col flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />Channels
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="px-4 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Public</div>
            {CHANNELS.filter(c => c.type === "public").map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel === ch.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="flex-1 text-left">{ch.name}</span>
              </button>
            ))}
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Private</div>
            {CHANNELS.filter(c => c.type === "private").map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel === ch.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full border-2 border-current" />
                </div>
                <span className="flex-1 text-left">{ch.name}</span>
              </button>
            ))}

            {/* Agent DMs */}
            {agents && (
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Agent DMs</div>
                {agents.map(agent => (
                  <button
                    key={agent.agentId}
                    onClick={() => setActiveChannel(`dm-${agent.agentId}`)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeChannel === `dm-${agent.agentId}` ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative">
                      <span className="text-base">{agent.emoji}</span>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                        agent.status !== "idle" ? "bg-green-500" : "bg-gray-400"
                      }`} />
                    </div>
                    <span className="flex-1 text-left">{agent.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="flex-1 glass flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg capitalize">{activeChannel.replace("dm-", "")}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {messages?.length ?? 0} messages · MongoDB live
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-1">Start the conversation in #{activeChannel}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                      {msg.senderEmoji || msg.sender[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.content}</p>
                      {msg.type === "file" && (
                        <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-center gap-3 max-w-sm">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <p className="text-sm font-medium">File attachment</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border/50">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                placeholder={`Message #${activeChannel}...`}
                className="min-h-[44px] max-h-32 resize-none"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Smile className="w-5 h-5" />
              </Button>
              <Button size="icon" className="h-10 w-10" onClick={handleSend} disabled={sending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Team sidebar */}
      {agents && (
        <div className="w-56 hidden xl:block">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />Team ({agents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents.map(agent => (
                <div key={agent.agentId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
                      {agent.emoji}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                      agent.status !== "idle" ? "bg-green-500" : "bg-gray-400"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">{agent.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
