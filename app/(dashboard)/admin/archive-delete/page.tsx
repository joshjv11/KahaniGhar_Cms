"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Story, Episode } from "@/lib/types/database";
import { Eye, EyeOff, Trash2, Archive, AlertTriangle, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface StoryWithCounts extends Story {
  episode_count?: number;
}

interface EpisodeWithStory extends Episode {
  story_title?: string;
  story_published?: boolean;
}

export default function ArchiveDeletePage() {
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryWithCounts[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeWithStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "story" | "episode" | null; id: string | null; title: string | null }>({
    open: false,
    type: null,
    id: null,
    title: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch all stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      // Fetch episode counts
      const storiesWithCounts = await Promise.all(
        (storiesData || []).map(async (story) => {
          const { count } = await supabase
            .from("episodes")
            .select("*", { count: "exact", head: true })
            .eq("story_id", story.id);
          return {
            ...story,
            episode_count: count || 0,
          };
        })
      );

      setStories(storiesWithCounts as StoryWithCounts[]);

      // Fetch all episodes with story info
      const { data: episodesData, error: episodesError } = await supabase
        .from("episodes")
        .select("*")
        .order("created_at", { ascending: false });

      if (episodesError) throw episodesError;

      // Enrich episodes with story info
      const episodesWithStory = await Promise.all(
        (episodesData || []).map(async (episode) => {
          const { data: storyData } = await supabase
            .from("stories")
            .select("title, is_published")
            .eq("id", episode.story_id)
            .single();
          return {
            ...episode,
            story_title: storyData?.title || "Unknown Story",
            story_published: storyData?.is_published || false,
          };
        })
      );

      setEpisodes(episodesWithStory as EpisodeWithStory[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveStory = async (storyId: string, isPublished: boolean) => {
    setActioning(`archive-story-${storyId}`);
    
    // Optimistic update
    const previousStories = [...stories];
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, is_published: !isPublished } : story
      )
    );
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ is_published: !isPublished })
        .eq("id", storyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: isPublished ? "Story archived (unpublished)" : "Story published",
      });
    } catch (error) {
      // Rollback on error
      setStories(previousStories);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update story",
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setActioning(`delete-story-${storyId}`);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;

      setStories((prev) => prev.filter((story) => story.id !== storyId));
      setDeleteDialog({ open: false, type: null, id: null, title: null });

      toast({
        title: "Success",
        description: "Story deleted permanently",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete story",
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleArchiveEpisode = async (episodeId: string, isPublished: boolean) => {
    setActioning(`archive-episode-${episodeId}`);
    
    // Optimistic update
    const previousEpisodes = [...episodes];
    setEpisodes((prev) =>
      prev.map((episode) =>
        episode.id === episodeId ? { ...episode, is_published: !isPublished } : episode
      )
    );
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("episodes")
        .update({ is_published: !isPublished })
        .eq("id", episodeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: isPublished ? "Episode archived (unpublished)" : "Episode published",
      });
    } catch (error) {
      // Rollback on error
      setEpisodes(previousEpisodes);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update episode",
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    setActioning(`delete-episode-${episodeId}`);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("episodes")
        .delete()
        .eq("id", episodeId);

      if (error) throw error;

      setEpisodes((prev) => prev.filter((episode) => episode.id !== episodeId));
      setDeleteDialog({ open: false, type: null, id: null, title: null });

      toast({
        title: "Success",
        description: "Episode deleted permanently",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete episode",
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const languageLabels: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
  };

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Archive & Delete" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Archive & Delete</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Manage story and episode lifecycle. Archive (unpublish) to hide content, or delete permanently.
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10 mb-8">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-foreground">
                Important:
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-6">
              <li><strong>Archive (Unpublish):</strong> Hides content from users but keeps it in the database. This action can be undone.</li>
              <li><strong>Delete:</strong> Permanently removes content from the database. This action cannot be undone and may affect related episodes and homepage placement.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border/40 rounded-md">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Stories Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Stories</h2>
            </div>
            {stories.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground/70 text-base">No stories found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {stories.map((story) => (
                  <Card key={story.id} className="border-border/60 hover:border-border transition-all duration-150 hover:shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={story.is_published ? "default" : "secondary"}>
                                {story.is_published ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Archived
                                  </>
                                )}
                              </Badge>
                              <Badge variant="outline">
                                {languageLabels[story.language] || story.language}
                              </Badge>
                              <span className="text-xs text-muted-foreground/70">
                                {story.episode_count || 0} episode{(story.episode_count || 0) !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          {story.episode_count! > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              ⚠️ This story has {story.episode_count} episode{(story.episode_count || 0) !== 1 ? "s" : ""}. Deleting will not delete episodes, but they will be orphaned.
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveStory(story.id, story.is_published)}
                            disabled={actioning === `archive-story-${story.id}`}
                            className="transition-all"
                          >
                            <Archive className={`h-4 w-4 mr-2 ${actioning === `archive-story-${story.id}` ? "animate-pulse" : ""}`} />
                            {actioning === `archive-story-${story.id}` 
                              ? "Processing..." 
                              : story.is_published 
                                ? "Archive" 
                                : "Publish"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, type: "story", id: story.id, title: story.title })}
                            disabled={actioning?.startsWith("delete-story")}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Episodes Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Episodes</h2>
            </div>
            {episodes.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-16 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-semibold">No episodes found</p>
                    <p className="text-muted-foreground/70 text-sm">Episodes will appear here once created</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <Card key={episode.id} className="border-border/60 hover:border-border transition-all duration-150 hover:shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{episode.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={episode.is_published ? "default" : "secondary"}>
                                {episode.is_published ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Archived
                                  </>
                                )}
                              </Badge>
                              <span className="text-xs text-muted-foreground/70">
                                Episode {episode.episode_number || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground/70">
                                Story: {episode.story_title}
                              </span>
                              <Badge variant={episode.story_published ? "default" : "secondary"} className="text-xs">
                                {episode.story_published ? "Story Published" : "Story Archived"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveEpisode(episode.id, episode.is_published)}
                            disabled={actioning === `archive-episode-${episode.id}`}
                            className="transition-all"
                          >
                            <Archive className={`h-4 w-4 mr-2 ${actioning === `archive-episode-${episode.id}` ? "animate-pulse" : ""}`} />
                            {actioning === `archive-episode-${episode.id}` 
                              ? "Processing..." 
                              : episode.is_published 
                                ? "Archive" 
                                : "Publish"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, type: "episode", id: episode.id, title: episode.title })}
                            disabled={actioning?.startsWith("delete-episode")}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, title: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type === "story" ? "Story" : "Episode"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "story" ? (
                <>
                  Are you sure you want to delete &quot;{deleteDialog.title}&quot;? This action cannot be undone.
                  <br /><br />
                  <strong>Warning:</strong> This will permanently remove the story from the database. Related episodes will be orphaned but not deleted.
                </>
              ) : (
                <>
                  Are you sure you want to delete &quot;{deleteDialog.title}&quot;? This action cannot be undone.
                  <br /><br />
                  <strong>Warning:</strong> This will permanently remove the episode from the database.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === "story" && deleteDialog.id) {
                  handleDeleteStory(deleteDialog.id);
                } else if (deleteDialog.type === "episode" && deleteDialog.id) {
                  handleDeleteEpisode(deleteDialog.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
