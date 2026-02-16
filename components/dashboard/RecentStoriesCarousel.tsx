"use client";

import Link from "next/link";
import Image from "next/image";
import { Story } from "@/lib/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

interface StoryWithCount extends Story {
  episode_count?: number;
}

export function RecentStoriesCarousel({
  stories,
}: {
  stories: StoryWithCount[];
}) {
  if (stories.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-1">
        Recently Updated Stories
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        Quick access to recently modified content
      </p>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="group flex-shrink-0 w-40 overflow-hidden transition-all duration-200 hover:border-primary/30"
          >
            <Link href={`/stories/${story.id}`} className="block relative aspect-[3/4] w-40">
              {story.cover_image_url ? (
                <Image
                  src={story.cover_image_url}
                  alt={story.title}
                  fill
                  className="object-cover transition-all duration-200 group-hover:scale-105 group-hover:opacity-70"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="h-9 w-9" asChild>
                  <Link href={`/stories/${story.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" variant="default" className="h-9 w-9" asChild>
                  <Link href={`/stories/${story.id}/edit`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Link>
            <div className="p-2">
              <p className="text-sm font-medium text-white truncate" title={story.title}>
                {story.title}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
