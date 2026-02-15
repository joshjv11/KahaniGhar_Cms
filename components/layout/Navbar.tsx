"use client";

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  // Auth removed - will add later
  return (
    <nav className={cn(
      "border-b-2 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-black/95 dark:from-black dark:via-blue-950 dark:to-navy backdrop-blur-md",
      "border-gold-500/40 dark:border-gold-500/30",
      "shadow-lg dark:shadow-gold-500/10",
      "transition-all duration-300 ease-out-smooth",
      "relative"
    )}>
      {/* Navbar bottom gold accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-60" />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-2 transition-all duration-300 ease-out-smooth",
              "hover:scale-105 gpu-accelerated",
              "group"
            )}
          >
            <BookOpen className={cn(
              "h-6 w-6 transition-all duration-300 ease-out-smooth",
              "text-blue-600 dark:text-blue-400",
              "group-hover:text-gold-500 dark:group-hover:text-gold-400",
              "group-hover:rotate-12"
            )} />
            <span className={cn(
              "text-xl font-bold bg-gradient-to-r",
              "from-blue-600 to-gold-500 dark:from-blue-400 dark:to-gold-400",
              "bg-clip-text text-transparent",
              "transition-all duration-300 ease-out-smooth"
            )}>
              Kahani Ghar CMS
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
