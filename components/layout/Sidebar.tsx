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

const discoveryItems: NavItem[] = [
  {
    title: "Ranking & Visibility",
    href: "/admin/ranking-visibility",
    icon: ArrowUpDown,
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
    <aside className="w-64 border-r-2 border-blue-primary/40 dark:border-blue-primary/30 bg-gradient-to-b from-white via-blue-50/20 to-gold-50/10 dark:from-navy dark:via-blue-950/50 dark:to-gold-950/20 backdrop-blur-md shadow-2xl dark:shadow-gold-500/10 h-[calc(100vh-73px)] fixed left-0 top-[73px] overflow-y-auto z-10 transition-all duration-300 ease-out-smooth">
      {/* Sidebar edge decoration */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-gold-500/50 via-blue-primary/30 to-transparent" />
      <div className="p-6 space-y-10">
        {/* Overview Section */}
        <div>
          <Link
            href="/dashboard"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out-smooth group will-change-transform gpu-accelerated",
              isOverviewActive
                ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
            )}
          >
            <Home className={cn(
              "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
              isOverviewActive ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
            )} />
            <span>Overview</span>
          </Link>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
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
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group gpu-accelerated",
                    active
                      ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                      : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    active ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Discovery Section */}
        <div className="space-y-3">
          <div className="px-3 mb-1">
            <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Discovery
            </h2>
          </div>
          <nav className="space-y-0.5">
            {discoveryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group gpu-accelerated",
                    active
                      ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                      : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    active ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
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
            <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
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
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group gpu-accelerated",
                    active
                      ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                      : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    active ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
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
            <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
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
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group gpu-accelerated",
                    active
                      ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                      : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    active ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
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
            <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
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
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] group gpu-accelerated",
                    active
                      ? "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white font-semibold shadow-lg shadow-gold-500/40 dark:shadow-gold-500/30 animate-blue-gold-gradient"
                      : "text-slate-900 dark:text-slate-100 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-900 dark:hover:text-gold-300 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    active ? "text-white scale-110 drop-shadow-lg" : "text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-300 group-hover:scale-110"
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
