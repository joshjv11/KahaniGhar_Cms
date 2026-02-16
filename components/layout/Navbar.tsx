"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { useCommandPalette } from "@/components/layout/CommandPaletteTrigger";

export function Navbar() {
  const openCommand = useCommandPalette();

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/5",
        "bg-slate-950/50 dark:bg-[#020617]/50 backdrop-blur-md",
        "transition-all duration-300"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-all duration-200 hover:opacity-90 group"
          >
            <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-[#FFB800] transition-colors" />
            <span className="text-lg font-bold text-white">Kahani Ghar CMS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openCommand}
              className="gap-2 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
