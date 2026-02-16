"use client";

import { cn } from "@/lib/utils/cn";

type Status = "published" | "draft" | "archived";

const styles: Record<
  Status,
  { dot: string; bg: string; text: string; label: string }
> = {
  published: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    label: "Published",
  },
  draft: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    label: "Draft",
  },
  archived: {
    dot: "bg-slate-500",
    bg: "bg-slate-500/10 border-slate-500/30",
    text: "text-slate-400",
    label: "Archived",
  },
};

interface StatusPillProps {
  status: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        s.bg,
        s.text,
        status === "archived" && "line-through",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

export function storyToStatus(
  isPublished: boolean,
  isArchived?: boolean
): Status {
  if (isArchived) return "archived";
  return isPublished ? "published" : "draft";
}
