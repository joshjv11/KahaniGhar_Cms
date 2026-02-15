"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Story } from "@/lib/types/database";
import { Eye, Edit, Archive, ArchiveRestore, MoreVertical, Home, Sparkles } from "lucide-react";
import Image from "next/image";
import { ContentStateBadge } from "@/components/content/ContentStateBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { playSound } from "@/lib/utils/sounds";

interface StoryCardProps {
  story: Story;
  onToggleArchive: (id: string, isPublished: boolean) => void;
}

const languageLabels: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
};

export function StoryCard({ story, onToggleArchive }: StoryCardProps) {
  return (
    <Card 
      className="overflow-hidden bg-gradient-to-br from-white via-blue-100/40 to-gold-100/30 dark:from-navy dark:via-blue-900/60 dark:to-gold-900/30 border-2 border-blue-primary/40 dark:border-blue-primary/30 shadow-xl hover:shadow-2xl hover:shadow-gold-500/40 dark:hover:shadow-gold-500/30 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-3 hover:scale-[1.03] hover:border-gold-500/70 dark:hover:border-gold-500/60 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 gpu-accelerated hover:animate-gold-glow backdrop-blur-sm"
      onMouseEnter={() => playSound('hover')}
    >
      <div className="relative h-48 w-full">
        {story.cover_image_url ? (
          <Image
            src={story.cover_image_url}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        {/* Corner indicators for Featured/Banner */}
        <div className="absolute top-2 left-2 flex gap-1">
          {story.is_banner && (
            <div className="bg-gradient-to-r from-blue-primary to-blue-dark text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 shadow-md shadow-blue-primary/30">
              <Home className="h-3 w-3" />
              Banner
            </div>
          )}
          {story.is_new_launch && (
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-black px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 shadow-md shadow-gold-500/40 animate-gold-pulse">
              <Sparkles className="h-3 w-3" />
              New
            </div>
          )}
        </div>
        {/* Status badge in top right */}
        <div className="absolute top-2 right-2">
          <ContentStateBadge story={story} />
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">{story.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-semibold">
                {languageLabels[story.language] || story.language}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Only show description if it exists */}
        {story.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {story.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          {/* Primary action: Edit */}
          <Link href={`/stories/${story.id}/edit`} className="flex-1">
            <Button variant="default" size="sm" className="w-full" soundType="save" playHoverSound>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {/* Secondary action: View (icon only) */}
          <Link href={`/stories/${story.id}`}>
            <Button variant="outline" size="sm" className="px-3" soundType="click" playHoverSound>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {/* Destructive actions in menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-3" soundType="toggle" playHoverSound>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  playSound(story.is_published ? 'toggle' : 'success');
                  onToggleArchive(story.id, story.is_published);
                }}
                className={story.is_published ? "text-amber-600" : "text-green-600"}
              >
                {story.is_published ? (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
