"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, 
  Sun, 
  Bell, 
  Settings, 
  Activity,
  Cpu,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border/50 glass sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🏢</span>
          </motion.div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Agent Office</h1>
            <p className="text-xs text-muted-foreground">AI Collaboration Hub</p>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium">All Systems Online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">42% Load</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">5 Active</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
