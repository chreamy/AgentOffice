"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  MoreHorizontal,
  Clock,
  Filter
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info" | "error";
  agent: string;
  emoji: string;
  message: string;
  timestamp: string;
  metadata?: string;
}

const activities: ActivityItem[] = [
  { id: "1", type: "success", agent: "Arch", emoji: "🏗️", message: "Completed dashboard layout", timestamp: "2m ago", metadata: "UI Components" },
  { id: "2", type: "info", agent: "Kiyo", emoji: "🦾", message: "Started strategic review", timestamp: "5m ago", metadata: "Planning" },
  { id: "3", type: "warning", agent: "Atlas", emoji: "🌐", message: "API rate limit approaching", timestamp: "8m ago", metadata: "System" },
  { id: "4", type: "success", agent: "Echo", emoji: "📊", message: "Analytics pipeline updated", timestamp: "12m ago", metadata: "Data" },
  { id: "5", type: "info", agent: "Nova", emoji: "✨", message: "Shared design mockups", timestamp: "15m ago", metadata: "Design" },
  { id: "6", type: "success", agent: "Arch", emoji: "🏗️", message: "Fixed WebSocket connection", timestamp: "18m ago", metadata: "Backend" },
  { id: "7", type: "error", agent: "Echo", emoji: "📊", message: "Database sync failed", timestamp: "22m ago", metadata: "Retry #2" },
  { id: "8", type: "success", agent: "Kiyo", emoji: "🦾", message: "Approved Q2 roadmap", timestamp: "25m ago", metadata: "Strategy" },
  { id: "9", type: "info", agent: "Atlas", emoji: "🌐", message: "New research findings", timestamp: "30m ago", metadata: "Research" },
  { id: "10", type: "success", agent: "Nova", emoji: "✨", message: "Color palette finalized", timestamp: "35m ago", metadata: "Branding" },
];

const getIcon = (type: string) => {
  switch (type) {
    case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "success": return "border-l-green-500";
    case "warning": return "border-l-amber-500";
    case "error": return "border-l-red-500";
    default: return "border-l-blue-500";
  }
};

export function ActivityFeed() {
  return (
    <Card className="w-80 glass border-l-0 hidden lg:flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Feed
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Filter className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">{activities.length} updates</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="px-4 pb-4 space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg bg-muted/30 border-l-2 ${getBorderColor(activity.type)} hover:bg-muted/50 transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-2">
                  {getIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{activity.emoji}</span>
                      <span className="font-medium text-sm">{activity.agent}</span>
                    </div>
                    <p className="text-sm mt-0.5">{activity.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {activity.metadata}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
