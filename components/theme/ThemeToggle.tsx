"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-lg"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "h-9 w-9 rounded-lg transition-all duration-300 ease-out-smooth",
        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-gold-50",
        "dark:hover:from-blue-950/50 dark:hover:to-gold-950/50",
        "hover:border hover:border-gold-500/30",
        "focus-visible:ring-2 focus-visible:ring-gold-500/50",
        "gpu-accelerated"
      )}
      aria-label="Toggle theme"
    >
      <Sun className={cn(
        "h-4 w-4 transition-all duration-300 ease-out-smooth",
        "rotate-0 scale-100 dark:-rotate-90 dark:scale-0",
        "text-blue-600 dark:text-gold-500"
      )} />
      <Moon className={cn(
        "absolute h-4 w-4 transition-all duration-300 ease-out-smooth",
        "rotate-90 scale-0 dark:rotate-0 dark:scale-100",
        "text-gold-500 dark:text-blue-400"
      )} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
