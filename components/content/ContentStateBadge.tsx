"use client";

import { Badge } from "@/components/ui/badge";
import { Story } from "@/lib/types/database";
import { Eye, EyeOff, Star, Home, Sparkles, Archive } from "lucide-react";

export type ContentState = "draft" | "ready" | "published" | "featured" | "archived";

interface ContentStateBadgeProps {
  story: Story;
  episodeCount?: number;
  className?: string;
  showTooltip?: boolean;
}

export function ContentStateBadge({ story, episodeCount = 0, className, showTooltip = false }: ContentStateBadgeProps) {
  const getState = (): ContentState => {
    if (!story.is_published) {
      return "draft";
    }
    
    const hasHomepageConfig = story.is_banner || story.is_new_launch || (story.homepage_rank !== null && story.homepage_rank !== undefined);
    
    if (hasHomepageConfig) {
      return "featured";
    }
    
    const isComplete = story.title && story.cover_image_url && story.description && episodeCount > 0;
    
    if (!isComplete) {
      return "ready";
    }
    
    return "published";
  };

  const state = getState();
  
  // Generate helpful tooltip text for accessibility
  const getTooltipText = (): string => {
    switch (state) {
      case "draft":
        return "Story is not published and not visible to users";
      case "ready":
        return "Story is published but may be missing content (episodes, description, or images)";
      case "published":
        return "Story is published and complete";
      case "featured":
        return "Story is published and featured on homepage (banner, new launch, or ranked)";
      case "archived":
        return "Story is archived (unpublished)";
      default:
        return "";
    }
  };

  const stateConfig = {
    draft: {
      label: "Draft",
      variant: "secondary" as const,
      icon: EyeOff,
      color: "text-muted-foreground",
    },
    ready: {
      label: "Ready",
      variant: "outline" as const,
      icon: Eye,
      color: "text-blue-600 dark:text-blue-400",
    },
    published: {
      label: "Published",
      variant: "default" as const,
      icon: Eye,
      color: "text-green-600 dark:text-green-400",
    },
    featured: {
      label: "Featured",
      variant: "default" as const,
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
    },
    archived: {
      label: "Archived",
      variant: "secondary" as const,
      icon: Archive,
      color: "text-muted-foreground",
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`transition-all ${className}`}
      title={showTooltip ? getTooltipText() : undefined}
      aria-label={getTooltipText()}
    >
      <Icon className={`h-3 w-3 mr-1 ${config.color} transition-colors`} aria-hidden="true" />
      <span>{config.label}</span>
      {state === "featured" && (
        <>
          {story.is_banner && (
            <Home className="h-3 w-3 ml-1 text-amber-600 dark:text-amber-400" aria-label="Banner" />
          )}
          {story.is_new_launch && (
            <Sparkles className="h-3 w-3 ml-1 text-amber-600 dark:text-amber-400" aria-label="New Launch" />
          )}
        </>
      )}
    </Badge>
  );
}
