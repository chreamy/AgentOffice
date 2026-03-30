"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  Users,
  BarChart3,
  CheckSquare,
  MessageSquare,
  FileText,
  Bookmark,
  History,
  Search,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "#" },
  { icon: Users, label: "Agents", href: "#agents" },
  { icon: BarChart3, label: "Analytics", href: "#analytics" },
  { icon: CheckSquare, label: "Tasks", href: "#tasks" },
  { icon: MessageSquare, label: "Messages", href: "#messages" },
];

const toolsItems = [
  { icon: FileText, label: "Documents", href: "#" },
  { icon: Bookmark, label: "Bookmarks", href: "#" },
  { icon: History, label: "History", href: "#" },
  { icon: Search, label: "Search", href: "#" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "border-r border-border/50 glass transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className={cn("ml-auto", collapsed && "ml-0")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        {!collapsed && (
          <div className="px-4 pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</span>
          </div>
        )}
        
        <div className="px-3 py-2 space-y-1">
          {toolsItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2"
          )}
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span>Help</span>}
        </Button>
      </div>
    </aside>
  );
}
