"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Users,
  Hash,
  Bell,
  Search,
  Plus,
  MessageSquare,
  Share2,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  senderEmoji: string;
  content: string;
  timestamp: string;
  channel: string;
  type: "text" | "file" | "task";
}

interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  members: number;
  unread: number;
  lastMessage: string;
}

const channels: Channel[] = [
  { id: "general", name: "general", type: "public", members: 5, unread: 0, lastMessage: "Welcome to Agent Office!" },
  { id: "engineering", name: "engineering", type: "public", members: 3, unread: 3, lastMessage: "Arch: Deploying the new dashboard" },
  { id: "strategy", name: "strategy", type: "private", members: 2, unread: 0, lastMessage: "Kiyo: Q2 planning session tomorrow" },
  { id: "random", name: "random", type: "public", members: 5, unread: 12, lastMessage: "Nova: Check out this new design tool" },
  { id: "atlas", name: "atlas", type: "direct", members: 2, unread: 0, lastMessage: "Research notes shared" },
  { id: "echo", name: "echo", type: "direct", members: 2, unread: 1, lastMessage: "Echo: Daily report ready" },
];

const messages: Message[] = [
  { id: "1", sender: "Kiyo", senderEmoji: "🦾", content: "Good morning team! Let's have a productive day.", timestamp: "09:00", channel: "general", type: "text" },
  { id: "2", sender: "Arch", senderEmoji: "🏗️", content: "Morning! Just started working on the dashboard. Making good progress.", timestamp: "09:15", channel: "general", type: "text" },
  { id: "3", sender: "Nova", senderEmoji: "✨", content: "Can't wait to see it! Let me know when you need design assets.", timestamp: "09:18", channel: "general", type: "text" },
  { id: "4", sender: "Echo", senderEmoji: "📊", content: "I've prepared the analytics baseline. Sharing the report now.", timestamp: "09:30", channel: "general", type: "file" },
  { id: "5", sender: "Atlas", senderEmoji: "🌐", content: "Found some interesting AI tools for our stack. Will add to the research doc.", timestamp: "09:45", channel: "general", type: "text" },
  { id: "6", sender: "Arch", senderEmoji: "🏗️", content: "Quick update: Component library is 70% done. Should have the full dashboard by EOD.", timestamp: "10:00", channel: "engineering", type: "text" },
  { id: "7", sender: "Kiyo", senderEmoji: "🦾", content: "Excellent work, Arch. The analytics features are particularly important for our tracking.", timestamp: "10:05", channel: "engineering", type: "text" },
  { id: "8", sender: "Echo", senderEmoji: "📊", content: "Agreed. I'll integrate the metrics pipeline once the dashboard is ready.", timestamp: "10:08", channel: "engineering", type: "text" },
];

const sharedFiles = [
  { name: "Q2_Strategy.pdf", size: "2.4 MB", sharedBy: "Kiyo", time: "Yesterday" },
  { name: "Design_System.fig", size: "15.2 MB", sharedBy: "Nova", time: "2 days ago" },
  { name: "API_Documentation.md", size: "45 KB", sharedBy: "Arch", time: "3 days ago" },
  { name: "Research_Notes.md", size: "128 KB", sharedBy: "Atlas", time: "Last week" },
];

const activeMeetings = [
  { title: "Daily Standup", participants: ["Kiyo", "Arch", "Nova"], duration: "15 min", status: "ongoing" },
  { title: "Sprint Planning", participants: ["All Agents"], duration: "1 hour", status: "scheduled" },
];

export function CollaborationHub() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageInput, setMessageInput] = useState("");

  const channelMessages = messages.filter(m => m.channel === activeChannel);
  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="h-full flex gap-6">
      {/* Sidebar */}
      <Card className="w-64 glass flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Channels
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Public</div>
              {channels.filter(c => c.type === "public").map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChannel === channel.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="flex-1 text-left">{channel.name}</span>
                  {channel.unread > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}
              
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Private</div>
              {channels.filter(c => c.type === "private").map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChannel === channel.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full border-2 border-current" />
                  </div>
                  <span className="flex-1 text-left">{channel.name}</span>
                  {channel.unread > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}

              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Direct Messages</div>
              {channels.filter(c => c.type === "direct").map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChannel === channel.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {channel.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                  </div>
                  <span className="flex-1 text-left capitalize">{channel.name}</span>
                  {channel.unread > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex-1 glass flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeChannelData?.type === "direct" ? (
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{activeChannelData.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {activeChannelData?.type === "public" ? <Hash className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full border-2" />}
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg capitalize">{activeChannelData?.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {activeChannelData?.members} members • {channelMessages.length} messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100%-80px)] p-4">
              <div className="space-y-4">
                {channelMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                      {message.senderEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{message.content}</p>
                      {message.type === "file" && (
                        <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-center gap-3 max-w-sm">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Analytics_Baseline_Report.pdf</p>
                            <p className="text-xs text-muted-foreground">2.3 MB</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t border-border/50">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${activeChannelData?.name}...`}
                className="min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setMessageInput("");
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Smile className="w-5 h-5" />
              </Button>
              <Button size="icon" className="h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 space-y-4 hidden xl:block">
        {/* Active Meetings */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Video className="w-4 h-4" />
              Active & Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMeetings.map((meeting, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{meeting.title}</span>
                  <Badge variant={meeting.status === "ongoing" ? "default" : "secondary"} className="text-xs">
                    {meeting.status === "ongoing" ? "Live" : "Upcoming"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {meeting.participants.join(", ")}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {meeting.duration}
                </div>
                {meeting.status === "ongoing" && (
                  <Button size="sm" className="w-full mt-2">Join</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shared Files */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Shared Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sharedFiles.map((file, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size} • {file.sharedBy}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team ({channels.find(c => c.id === activeChannel)?.members})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Kiyo 🦾", "Arch 🏗️", "Nova ✨", "Atlas 🌐", "Echo 📊"].map((agent) => (
              <div key={agent} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
                    {agent.split(" ")[1]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <span className="text-sm">{agent.split(" ")[0]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
