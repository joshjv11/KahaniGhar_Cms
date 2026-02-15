"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Story } from "@/lib/types/database";
import { StoryCard } from "@/components/story/StoryCard";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface StoriesListProps {
  initialStories: Story[];
}

export function StoriesList({ initialStories }: StoriesListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleArchive = async (id: string, isPublished: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ is_published: !isPublished })
        .eq("id", id);

      if (error) throw error;

      setStories(
        stories.map((story) =>
          story.id === id ? { ...story, is_published: !isPublished } : story
        )
      );

      toast({
        title: "Success",
        description: isPublished
          ? "Story unpublished"
          : "Story published",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update story",
        variant: "destructive",
      });
    }
  };

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stories yet. Create your first story!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.16, 1, 0.3, 1], // ultra-smooth ease
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <StoryCard
            story={story}
            onToggleArchive={handleToggleArchive}
          />
        </motion.div>
      ))}
    </div>
  );
}
