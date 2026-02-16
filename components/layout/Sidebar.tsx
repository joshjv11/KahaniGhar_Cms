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
  Home,
  ArrowUpDown,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const contentItems: NavItem[] = [
  { title: "Stories", href: "/admin/stories", icon: BookOpen },
  { title: "Episodes", href: "/admin/episodes", icon: FileText },
];

const discoveryItems: NavItem[] = [
  { title: "Ranking & Visibility", href: "/admin/ranking-visibility", icon: ArrowUpDown },
];

const usageItems: NavItem[] = [
  { title: "Listening Progress", href: "/admin/listening-progress", icon: Activity },
  { title: "Child Profiles", href: "/admin/child-profiles", icon: Users },
  { title: "Favorites", href: "/admin/favorites", icon: Heart },
];

const feedbackItems: NavItem[] = [
  { title: "Feedback Messages", href: "/admin/feedback", icon: MessageSquare },
];

const contentControlItems: NavItem[] = [
  { title: "Ranking & Visibility", href: "/admin/ranking-visibility", icon: ArrowUpDown },
  { title: "Archive & Delete", href: "/admin/archive-delete", icon: Trash2 },
];

function NavLink({
  href,
  icon: Icon,
  title,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
        "py-2.5",
        collapsed ? "px-3 justify-center" : "px-3",
        active
          ? "text-[#FFB800] bg-white/5"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
      title={collapsed ? title : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#FFB800] rounded-r" />
      )}
      <Icon className={cn("h-5 w-5 shrink-0", active && "text-[#FFB800]")} />
      {!collapsed && <span>{title}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    if (pathname === href) return true;
    if (href.startsWith("/admin") && pathname.startsWith(href)) return true;
    return false;
  };

  const isOverviewActive = pathname === "/dashboard" || pathname === "/";

  return (
    <aside
      className={cn(
        "fixed left-0 top-[65px] z-10 h-[calc(100vh-65px)] overflow-y-auto transition-all duration-300",
        "border-r border-white/5 bg-slate-950/50 backdrop-blur-xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex flex-col h-full", collapsed ? "p-2" : "p-4")}>
        <div className={cn("flex justify-end mb-4", collapsed && "justify-center")}>
          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="space-y-1">
          <NavLink
            href="/dashboard"
            icon={Home}
            title="Overview"
            active={!!isOverviewActive}
            collapsed={collapsed}
          />
        </nav>

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Content
            </span>
          </div>
        )}
        <nav className="space-y-0.5">
          {contentItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Discovery
            </span>
          </div>
        )}
        <nav className="space-y-0.5">
          {discoveryItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Usage & Activity
            </span>
          </div>
        )}
        <nav className="space-y-0.5">
          {usageItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Content Control
            </span>
          </div>
        )}
        <nav className="space-y-0.5">
          {contentControlItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Feedback
            </span>
          </div>
        )}
        <nav className="space-y-0.5">
          {feedbackItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
