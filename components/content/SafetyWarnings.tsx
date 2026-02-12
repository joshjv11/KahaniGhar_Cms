"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Story } from "@/lib/types/database";
import { AlertTriangle, Image as ImageIcon, Home, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SafetyWarningsProps {
  stories: Story[];
  episodesCount?: Record<string, number>;
  showActions?: boolean;
}

export function SafetyWarnings({ stories, episodesCount = {}, showActions = true }: SafetyWarningsProps) {
  const warnings: Array<{ type: "error" | "warning" | "info"; message: string; count: number }> = [];

  // Check for duplicate ranks
  const rankMap = new Map<number, string[]>();
  stories.forEach((story) => {
    if (story.homepage_rank !== null && story.homepage_rank !== undefined) {
      if (!rankMap.has(story.homepage_rank)) {
        rankMap.set(story.homepage_rank, []);
      }
      rankMap.get(story.homepage_rank)!.push(story.title);
    }
  });

  rankMap.forEach((titles, rank) => {
    if (titles.length > 1) {
      warnings.push({
        type: "warning",
        message: `Duplicate homepage rank ${rank}: ${titles.slice(0, 2).join(", ")}${titles.length > 2 ? ` and ${titles.length - 2} more` : ""}`,
        count: titles.length,
      });
    }
  });

  // Check for banner without image
  const bannerWithoutImage = stories.filter(
    s => s.is_banner && (!s.banner_image_url || s.banner_image_url.trim() === "")
  );
  if (bannerWithoutImage.length > 0) {
    warnings.push({
      type: "error",
      message: `${bannerWithoutImage.length} banner story/stories missing banner image`,
      count: bannerWithoutImage.length,
    });
  }

  // Check for new launch without image
  const newLaunchWithoutImage = stories.filter(
    s => s.is_new_launch && (!s.tile_image_url || s.tile_image_url.trim() === "")
  );
  if (newLaunchWithoutImage.length > 0) {
    warnings.push({
      type: "error",
      message: `${newLaunchWithoutImage.length} new launch story/stories missing tile image`,
      count: newLaunchWithoutImage.length,
    });
  }

  // Check for published stories without episodes
  const publishedWithoutEpisodes = stories.filter(
    s => s.is_published && (episodesCount[s.id] || 0) === 0
  );
  if (publishedWithoutEpisodes.length > 0) {
    warnings.push({
      type: "warning",
      message: `${publishedWithoutEpisodes.length} published story/stories have no episodes`,
      count: publishedWithoutEpisodes.length,
    });
  }

  // Check for archived content still ranked
  const archivedButRanked = stories.filter(
    s => !s.is_published && (s.homepage_rank !== null || s.is_banner || s.is_new_launch)
  );
  if (archivedButRanked.length > 0) {
    warnings.push({
      type: "info",
      message: `${archivedButRanked.length} archived story/stories still have homepage configuration`,
      count: archivedButRanked.length,
    });
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold">System Warnings</h3>
          </div>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-md ${
                  warning.type === "error"
                    ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                    : warning.type === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    warning.type === "error"
                      ? "text-red-600 dark:text-red-400"
                      : warning.type === "warning"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      warning.type === "error"
                        ? "text-red-800 dark:text-red-200"
                        : warning.type === "warning"
                        ? "text-amber-800 dark:text-amber-200"
                        : "text-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {warning.message}
                  </p>
                  {showActions && warning.type === "error" && (
                    <Link href="/admin/ranking-visibility" className="mt-1 inline-block">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Fix in Ranking & Visibility
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
                <Badge
                  variant={warning.type === "error" ? "destructive" : "secondary"}
                  className="text-xs flex-shrink-0"
                >
                  {warning.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
