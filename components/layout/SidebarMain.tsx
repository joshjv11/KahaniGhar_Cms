"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils/cn";

export function SidebarMain({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  return (
    <main
      className={cn(
        "flex-1 min-h-[calc(100vh-65px)] relative transition-[margin-left] duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}
    >
      {children}
    </main>
  );
}
