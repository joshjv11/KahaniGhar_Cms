"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill, storyToStatus } from "@/components/content/StatusPill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Story } from "@/lib/types/database";
import {
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  FileText,
  Eye,
  Copy,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StoryWithCount extends Story {
  episode_count: number;
}

function StoriesGridView({ stories, toast }: { stories: StoryWithCount[]; toast: ReturnType<typeof useToast>["toast"] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {stories.map((story) => (
        <Card key={story.id} className="group overflow-hidden">
          <div className="relative aspect-[3/4]">
            {story.cover_image_url ? (
              <Image src={story.cover_image_url} alt={story.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm">No image</div>
            )}
            <div className="absolute top-2 right-2">
              <StatusPill status={storyToStatus(story.is_published, false)} />
            </div>
          </div>
          <CardContent className="p-3 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate" title={story.title}>{story.title}</p>
                <p className="text-xs text-slate-500">{story.episode_count} episode{story.episode_count !== 1 ? "s" : ""}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
                  <DropdownMenuItem asChild><Link href={`/stories/${story.id}/edit`}><Pencil className="h-4 w-4 mr-2" />Edit Story</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/stories/${story.id}`}><FileText className="h-4 w-4 mr-2" />Manage Episodes</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/stories/${story.id}`} target="_blank"><Eye className="h-4 w-4 mr-2" />Preview</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Coming soon", description: "Duplicate story will be available in a future update." })}>
                    <Copy className="h-4 w-4 mr-2" />Duplicate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StoriesListView({ stories, toast }: { stories: StoryWithCount[]; toast: ReturnType<typeof useToast>["toast"] }) {
  return (
    <div className="space-y-1">
      {stories.map((story) => (
        <Card key={story.id} className="flex items-center gap-4 py-3 px-4 hover:border-white/20">
          <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-slate-800">
            {story.cover_image_url ? <Image src={story.cover_image_url} alt="" width={48} height={48} className="object-cover w-full h-full" unoptimized /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{story.title}</p>
            <p className="text-xs text-slate-500">{story.episode_count} episodes · Updated {new Date(story.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusPill status={storyToStatus(story.is_published, false)} />
            <span className="text-xs text-slate-500">{languageLabels[story.language] || story.language}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
                <DropdownMenuItem asChild><Link href={`/stories/${story.id}/edit`}><Pencil className="h-4 w-4 mr-2" />Edit Story</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/stories/${story.id}`}><FileText className="h-4 w-4 mr-2" />Manage Episodes</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/stories/${story.id}`} target="_blank"><Eye className="h-4 w-4 mr-2" />Preview</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Coming soon", description: "Duplicate story will be available in a future update." })}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}

const languageLabels: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
};

export function AdminStoriesView({
  stories,
}: {
  stories: StoryWithCount[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  if (!stories || stories.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <div className="text-slate-500 text-6xl mb-4">📭</div>
          <p className="text-slate-400 text-base mb-6">No stories found</p>
          <Link href="/stories/new">
            <Button>Create your first Story</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-slate-500 mr-2">View</span>
        <Button
          variant={view === "grid" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("grid")}
          title="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "list" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("list")}
          title="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      {view === "grid" ? (
        <StoriesGridView stories={stories} toast={toast} />
      ) : (
        <StoriesListView stories={stories} toast={toast} />
      )}
    </div>
  );
}
