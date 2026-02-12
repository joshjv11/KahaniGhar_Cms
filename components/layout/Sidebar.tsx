"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  BookOpen,
  FileText,
  Activity,
  Users,
  Heart,
  MessageSquare,
  BarChart3,
  Home,
  ArrowUpDown,
  Settings,
  Trash2,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const contentItems: NavItem[] = [
  {
    title: "Stories",
    href: "/admin/stories",
    icon: BookOpen,
  },
  {
    title: "Episodes",
    href: "/admin/episodes",
    icon: FileText,
  },
];

const usageItems: NavItem[] = [
  {
    title: "Listening Progress",
    href: "/admin/listening-progress",
    icon: Activity,
  },
  {
    title: "Child Profiles",
    href: "/admin/child-profiles",
    icon: Users,
  },
  {
    title: "Favorites",
    href: "/admin/favorites",
    icon: Heart,
  },
];

const feedbackItems: NavItem[] = [
  {
    title: "Feedback Messages",
    href: "/admin/feedback",
    icon: MessageSquare,
  },
];

const contentControlItems: NavItem[] = [
  {
    title: "Ranking & Visibility",
    href: "/admin/ranking-visibility",
    icon: ArrowUpDown,
  },
  {
    title: "Archive & Delete",
    href: "/admin/archive-delete",
    icon: Trash2,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    // For dashboard/overview, exact match
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    // Exact match or starts with the href path
    if (pathname === href) return true;
    // For admin routes, check if pathname starts with the href
    if (href.startsWith("/admin") && pathname.startsWith(href)) return true;
    return false;
  };

  const isOverviewActive = pathname === "/dashboard" || pathname === "/";

  return (
    <aside className="w-64 border-r border-border/40 bg-background h-[calc(100vh-73px)] fixed left-0 top-[73px] overflow-y-auto z-10">
      <div className="p-6 space-y-10">
        {/* Overview Section */}
        <div>
          <Link
            href="/dashboard"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
              isOverviewActive
                ? "bg-primary/10 text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            {isOverviewActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <Home className={cn(
              "h-4 w-4 transition-colors",
              isOverviewActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            <span>Overview</span>
          </Link>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Content
            </h2>
          </div>
          <nav className="space-y-0.5">
            {contentItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                    active
                      ? "bg-primary/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Usage & Activity Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Usage & Activity
            </h2>
          </div>
          <nav className="space-y-0.5">
            {usageItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                    active
                      ? "bg-primary/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Control Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Content Control
            </h2>
          </div>
          <nav className="space-y-0.5">
            {contentControlItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                    active
                      ? "bg-primary/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Feedback Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Feedback
            </h2>
          </div>
          <nav className="space-y-0.5">
            {feedbackItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                    active
                      ? "bg-primary/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
