"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  MoreHorizontal,
  Clock,
  Filter
} from "lucide-react";
import { useActivity } from "@/lib/hooks";

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

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ActivityFeed() {
  const { data: activities, loading } = useActivity(30);

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
          <span className="text-xs text-muted-foreground">{activities?.length ?? 0} updates</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="px-4 pb-4 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))
            ) : !activities || activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1 opacity-60">Agent events will appear here</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`p-3 rounded-lg bg-muted/30 border-l-2 ${getBorderColor(activity.type)} hover:bg-muted/50 transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-2">
                    {getIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{activity.agentEmoji}</span>
                        <span className="font-medium text-sm">{activity.agentName}</span>
                      </div>
                      <p className="text-sm mt-0.5">{activity.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        {activity.metadata && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {activity.metadata}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
