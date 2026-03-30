"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, CheckCircle, AlertTriangle, Info,
  MoreHorizontal, Clock, Filter,
} from "lucide-react";
import { useActivity } from "@/lib/hooks";

interface ActivityFeedProps {
  mobile?: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case "success": return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case "error":   return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    default:        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "success": return "border-l-green-500";
    case "warning": return "border-l-amber-500";
    case "error":   return "border-l-red-500";
    default:        return "border-l-blue-500";
  }
};

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function FeedContent({ activities, loading }: { activities: ReturnType<typeof useActivity>["data"]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity._id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={`p-3 rounded-lg bg-muted/30 border-l-2 ${getBorderColor(activity.type)} hover:bg-muted/50 transition-colors`}
        >
          <div className="flex items-start gap-2">
            {getIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base leading-none">{activity.agentEmoji}</span>
                <span className="font-medium text-sm">{activity.agentName}</span>
              </div>
              <p className="text-sm mt-0.5 break-words">{activity.message}</p>
              <div className="flex items-center justify-between mt-1.5">
                {activity.metadata && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{activity.metadata}</Badge>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                  <Clock className="w-3 h-3" />{timeAgo(activity.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ActivityFeed({ mobile = false }: ActivityFeedProps) {
  const { data: activities, loading } = useActivity(30);

  // Mobile: full-page card
  if (mobile) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          <p className="text-muted-foreground">Live stream of agent events</p>
        </div>
        <Card className="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />Activity
              </CardTitle>
              <Badge variant="secondary" className="text-xs gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live · {activities?.length ?? 0}
              </Badge>
            </div>
          </CardHeader>
          <FeedContent activities={activities} loading={loading} />
        </Card>
      </div>
    );
  }

  // Desktop: sidebar panel
  return (
    <Card className="w-72 xl:w-80 glass border-l-0 hidden lg:flex flex-col flex-shrink-0 rounded-none">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />Activity Feed
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
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">{activities?.length ?? 0} events</span>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <FeedContent activities={activities} loading={loading} />
      </ScrollArea>
    </Card>
  );
}
