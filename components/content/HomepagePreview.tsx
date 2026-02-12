"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Story } from "@/lib/types/database";
import { Home, Sparkles, Eye } from "lucide-react";
import Image from "next/image";

interface HomepagePreviewProps {
  stories: Story[];
}

export function HomepagePreview({ stories }: HomepagePreviewProps) {
  // Get banner stories
  const bannerStories = stories
    .filter(s => s.is_published && s.is_banner && s.banner_image_url)
    .slice(0, 5); // Limit to 5

  // Get homepage ranked stories
  const rankedStories = stories
    .filter(s => s.is_published && s.homepage_rank !== null && s.homepage_rank !== undefined)
    .sort((a, b) => (a.homepage_rank || 0) - (b.homepage_rank || 0))
    .slice(0, 6); // Limit to 6

  // Get new launch stories
  const newLaunchStories = stories
    .filter(s => s.is_published && s.is_new_launch && s.tile_image_url)
    .sort((a, b) => (a.new_launch_rank || 0) - (b.new_launch_rank || 0))
    .slice(0, 8); // Limit to 8

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Homepage Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Banner Section */}
        {bannerStories.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Banner Carousel</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {bannerStories.map((story) => (
                <div
                  key={story.id}
                  className="flex-shrink-0 w-48 h-32 rounded-md overflow-hidden border border-border/60 relative transition-all hover:border-border hover:shadow-sm"
                  title={story.title}
                >
                  {story.banner_image_url && (
                    <Image
                      src={story.banner_image_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                    <p className="text-xs font-medium truncate">{story.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Homepage Ranked Sections */}
        {rankedStories.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Homepage Sections</h3>
            </div>
            <div className="space-y-2">
              {rankedStories.map((story, index) => (
                <div
                  key={story.id}
                  className="flex items-center gap-3 p-2 rounded-md border border-border/40 hover:bg-muted/30 transition-all duration-150 hover:border-border/60"
                  title={`${story.title} - Rank ${story.homepage_rank}`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                    {story.homepage_rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{story.title}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Rank {story.homepage_rank}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Launches Section */}
        {newLaunchStories.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">New Launches</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {newLaunchStories.map((story) => (
                <div
                  key={story.id}
                  className="aspect-square rounded-md overflow-hidden border border-border/60 relative transition-all hover:border-border hover:shadow-sm"
                  title={story.title}
                >
                  {story.tile_image_url && (
                    <Image
                      src={story.tile_image_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1">
                    <p className="text-xs truncate">{story.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bannerStories.length === 0 && rankedStories.length === 0 && newLaunchStories.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
              <Eye className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No homepage content</p>
            <p className="text-xs text-muted-foreground/70">Publish stories and configure them below to see preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
