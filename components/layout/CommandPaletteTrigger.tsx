"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  FileText,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  BarChart3,
  MessageSquare,
  Trash2,
  Heart,
  Users,
  Activity,
  Home,
} from "lucide-react";

const CommandPaletteContext = React.createContext<() => void>(() => {});

export function useCommandPalette() {
  return React.useContext(CommandPaletteContext);
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Stories", href: "/admin/stories", icon: BookOpen },
  { label: "Episodes", href: "/admin/episodes", icon: FileText },
  { label: "Ranking & Visibility", href: "/admin/ranking-visibility", icon: ArrowUpDown },
  { label: "Listening Progress", href: "/admin/listening-progress", icon: Activity },
  { label: "Child Profiles", href: "/admin/child-profiles", icon: Users },
  { label: "Favorites", href: "/admin/favorites", icon: Heart },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Archive & Delete", href: "/admin/archive-delete", icon: Trash2 },
];

export function CommandPaletteTrigger() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [stories, setStories] = React.useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  const openCommand = React.useCallback(() => setOpen(true), []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase
          .from("stories")
          .select("id, title")
          .order("created_at", { ascending: false })
          .limit(50);
        setStories(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const run = React.useCallback(
    (fn: () => void) => {
      setOpen(false);
      fn();
    },
    []
  );

  return (
    <CommandPaletteContext.Provider value={openCommand}>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search stories or navigate..." />
        <CommandList>
          <CommandEmpty>
            {loading ? "Loading..." : "No results found."}
          </CommandEmpty>
          {stories.length > 0 && (
            <CommandGroup heading="Stories">
              {stories.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.title}
                  onSelect={() => run(() => router.push(`/stories/${s.id}`))}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {s.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => run(() => router.push("/stories/new"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Story
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => run(() => router.push(item.href))}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
