"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Bell, Menu, Activity, Cpu, Zap } from "lucide-react";
import { useAgents, useTasks } from "@/lib/hooks";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: agents } = useAgents();
  const { data: tasks } = useTasks();

  const online = agents?.filter(a => a.status !== "idle").length ?? 0;
  const p0open = tasks?.filter(t => t.priority === "P0" && t.status !== "done").length ?? 0;

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between gap-3">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base md:text-lg flex-shrink-0">
              🏢
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-sm md:text-base">Agent Office</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">AI Collaboration Hub</p>
            </div>
          </div>
        </div>

        {/* Center: status pills — hidden on small mobile */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-green-500" />
            All Systems Online
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            {online}/{agents?.length ?? 5} Active
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {tasks?.length ?? 0} Tasks
          </div>
        </div>

        {/* Compact status for tablet */}
        <div className="hidden md:flex lg:hidden items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {online} active · {tasks?.length ?? 0} tasks
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-9 md:w-9">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {p0open > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                {p0open}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
