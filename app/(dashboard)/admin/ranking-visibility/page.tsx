"use client";

/**
 * Ranking & Visibility Page
 * 
 * UX Improvements (Phase 4 Polish):
 * - Optimistic updates with automatic rollback on error for instant feedback
 * - Confirmation dialogs for rank conflicts to prevent accidental duplicates
 * - Clear disabled states with tooltips explaining why actions are disabled
 * - Enhanced empty states with actionable guidance and CTAs
 * - Skeleton loaders instead of spinners for better perceived performance
 * - Micro-interactions (smooth transitions, hover states) for polish
 * - Accessibility: ARIA labels, keyboard navigation hints, semantic HTML
 * - Real-time safety warnings with actionable links
 * - Homepage preview for "see before commit" confidence
 */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import { Story } from "@/lib/types/database";
import { Home, Eye, EyeOff, AlertTriangle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { HomepagePreview } from "@/components/content/HomepagePreview";
import { SafetyWarnings } from "@/components/content/SafetyWarnings";
import { ContentStateBadge } from "@/components/content/ContentStateBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StoryWithCounts extends Story {
  episode_count?: number;
}

export default function RankingVisibilityPage() {
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingRanks, setEditingRanks] = useState<Record<string, { homepage: number | null; newLaunch: number | null }>>({});
  const [rankCollisions, setRankCollisions] = useState<Record<number, string[]>>({});
  const [bannerImageUrls, setBannerImageUrls] = useState<Record<string, string>>({});
  const [tileImageUrls, setTileImageUrls] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "banner" | "newLaunch" | "ranked" | "unranked">("all");
  const [languageFilter, setLanguageFilter] = useState<"all" | "en" | "hi" | "ta">("all");

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch all stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .order("homepage_rank", { ascending: true, nullsFirst: false })
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
      
      // Initialize editing ranks and images
      const initialRanks: Record<string, { homepage: number | null; newLaunch: number | null }> = {};
      const initialBannerImages: Record<string, string> = {};
      const initialTileImages: Record<string, string> = {};
      
      storiesWithCounts.forEach((story) => {
        initialRanks[story.id] = {
          homepage: story.homepage_rank,
          newLaunch: story.new_launch_rank,
        };
        initialBannerImages[story.id] = story.banner_image_url || "";
        initialTileImages[story.id] = story.tile_image_url || "";
      });
      
      setEditingRanks(initialRanks);
      setBannerImageUrls(initialBannerImages);
      setTileImageUrls(initialTileImages);

      // Check for collisions
      checkRankCollisions(storiesWithCounts as StoryWithCounts[]);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkRankCollisions = (storiesToCheck: StoryWithCounts[]) => {
    const collisions: Record<number, string[]> = {};
    const rankMap = new Map<number, string[]>();

    storiesToCheck.forEach((story) => {
      const rank = story.homepage_rank;
      if (rank !== null && rank !== undefined) {
        if (!rankMap.has(rank)) {
          rankMap.set(rank, []);
        }
        rankMap.get(rank)!.push(story.title);
      }
    });

    rankMap.forEach((titles, rank) => {
      if (titles.length > 1) {
        collisions[rank] = titles;
      }
    });

    setRankCollisions(collisions);
  };

  const handleRankChange = (storyId: string, type: "homepage" | "newLaunch", value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);
    if (value !== "" && (isNaN(numValue!) || numValue! < 0)) {
      return; // Invalid input
    }

    setEditingRanks((prev) => ({
      ...prev,
      [storyId]: {
        ...prev[storyId],
        [type]: numValue,
      },
    }));

    // Check for collisions in real-time
    const updatedStories = stories.map((story) => ({
      ...story,
      homepage_rank: story.id === storyId && type === "homepage" ? numValue : story.homepage_rank,
    }));
    checkRankCollisions(updatedStories);
  };

  const handleToggleBanner = async (storyId: string, enabled: boolean) => {
    setSaving(storyId);
    
    // Optimistic update
    const previousStories = [...stories];
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, is_banner: enabled } : story
      )
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ is_banner: enabled })
        .eq("id", storyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: enabled ? "Story added to banner" : "Story removed from banner",
      });
    } catch (error) {
      // Rollback on error
      setStories(previousStories);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update banner status",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleToggleNewLaunch = async (storyId: string, enabled: boolean) => {
    setSaving(storyId);
    
    // Optimistic update
    const previousStories = [...stories];
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, is_new_launch: enabled } : story
      )
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ is_new_launch: enabled })
        .eq("id", storyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: enabled ? "Story added to new launches" : "Story removed from new launches",
      });
    } catch (error) {
      // Rollback on error
      setStories(previousStories);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update new launch status",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveRank = async (storyId: string, type: "homepage" | "newLaunch") => {
    const newRank = editingRanks[storyId]?.[type];
    const fieldName = type === "homepage" ? "homepage_rank" : "new_launch_rank";
    
    // Check for conflicts before saving
    if (newRank !== null && newRank !== undefined) {
      const conflictingStories = stories.filter(
        s => s.id !== storyId && s[fieldName] === newRank
      );
      
      if (conflictingStories.length > 0) {
        const conflictNames = conflictingStories.map(s => s.title).slice(0, 2).join(", ");
        const confirmMessage = `Rank ${newRank} is already used by: ${conflictNames}${conflictingStories.length > 2 ? ` and ${conflictingStories.length - 2} more` : ""}. Continue anyway?`;
        
        if (!confirm(confirmMessage)) {
          return; // User cancelled
        }
      }
    }
    
    setSaving(`${storyId}-${type}`);
    
    // Optimistic update
    const previousStories = [...stories];
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? { ...story, [fieldName]: newRank }
          : story
      )
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ [fieldName]: newRank })
        .eq("id", storyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type === "homepage" ? "Homepage" : "New launch"} rank updated to ${newRank ?? "unranked"}`,
      });

      // Re-check collisions
      const updatedStories = stories.map((story) =>
        story.id === storyId
          ? { ...story, [fieldName]: newRank }
          : story
      );
      checkRankCollisions(updatedStories);
    } catch (error) {
      // Rollback on error
      setStories(previousStories);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rank",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleImageUpload = async (storyId: string, type: "banner" | "tile", url: string) => {
    setSaving(`${storyId}-${type}`);
    try {
      const supabase = createClient();
      const fieldName = type === "banner" ? "banner_image_url" : "tile_image_url";
      const { error } = await supabase
        .from("stories")
        .update({ [fieldName]: url })
        .eq("id", storyId);

      if (error) throw error;

      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, [fieldName]: url } : story
        )
      );

      if (type === "banner") {
        setBannerImageUrls((prev) => ({ ...prev, [storyId]: url }));
      } else {
        setTileImageUrls((prev) => ({ ...prev, [storyId]: url }));
      }

      toast({
        title: "Success",
        description: `${type === "banner" ? "Banner" : "Tile"} image uploaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const languageLabels: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
  };

  // Apply filters
  const filteredStories = stories.filter((story) => {
    // Status filter
    if (statusFilter === "published" && !story.is_published) return false;
    if (statusFilter === "draft" && story.is_published) return false;

    // Visibility filter
    if (visibilityFilter === "banner" && !story.is_banner) return false;
    if (visibilityFilter === "newLaunch" && !story.is_new_launch) return false;
    if (visibilityFilter === "ranked" && (story.homepage_rank === null || story.homepage_rank === undefined)) return false;
    if (visibilityFilter === "unranked" && (story.homepage_rank !== null && story.homepage_rank !== undefined)) return false;

    // Language filter
    if (languageFilter !== "all" && story.language !== languageFilter) return false;

    return true;
  });

  // Separate ranked and unranked stories (for display purposes)
  const rankedStories = filteredStories.filter(
    (s) => s.homepage_rank !== null && s.homepage_rank !== undefined
  );
  const unrankedStories = filteredStories.filter(
    (s) => s.homepage_rank === null || s.homepage_rank === undefined
  );

  // Sort ranked stories by rank
  rankedStories.sort((a, b) => (a.homepage_rank || 0) - (b.homepage_rank || 0));

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Ranking & Visibility" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Ranking & Visibility</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Control homepage ordering, banner inclusion, and new launch placement for all stories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Explanation Card */}
        <Card className="border-border/60 bg-blue-50/30 dark:bg-blue-950/10 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                How this works:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Homepage Rank:</strong> Lower numbers appear first (Rank 1 = top priority). Unranked stories won&apos;t appear in homepage sections.</li>
                <li><strong>Banner:</strong> Stories in the banner carousel require a banner image. Enable/disable instantly.</li>
                <li><strong>New Launches:</strong> Stories in the new launches section require a tile image. Each can have its own ranking.</li>
                <li>Changes are saved immediately when you click &quot;Save&quot; or toggle switches.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Preview */}
        <div className="lg:col-span-1">
          <HomepagePreview stories={stories} />
        </div>
      </div>

      {/* Safety Warnings */}
      {!loading && (
        <div className="mb-8">
          <SafetyWarnings 
            stories={stories} 
            episodesCount={Object.fromEntries(stories.map(s => [s.id, s.episode_count || 0]))}
          />
        </div>
      )}

      {loading ? (
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Status:</label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Visibility:</label>
                  <Select value={visibilityFilter} onValueChange={(value: any) => setVisibilityFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="newLaunch">New Launch</SelectItem>
                      <SelectItem value="ranked">Ranked</SelectItem>
                      <SelectItem value="unranked">Unranked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Language:</label>
                  <Select value={languageFilter} onValueChange={(value: any) => setLanguageFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredStories.length} of {stories.length} stories
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Story</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Homepage Rank</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Banner</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Banner Rank</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">New Launch</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">New Launch Rank</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((story) => {
                  const currentHomepageRank = editingRanks[story.id]?.homepage ?? story.homepage_rank;
                  const currentNewLaunchRank = editingRanks[story.id]?.newLaunch ?? story.new_launch_rank;
                  const hasHomepageCollision = currentHomepageRank !== null && rankCollisions[currentHomepageRank]?.includes(story.title);
                  const bannerImage = bannerImageUrls[story.id] || story.banner_image_url || "";
                  const tileImage = tileImageUrls[story.id] || story.tile_image_url || "";

                  return (
                    <tr 
                      key={story.id} 
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors duration-150"
                      aria-label={`Story: ${story.title}`}
                    >
                      {/* Story Info */}
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="font-semibold">{story.title}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <ContentStateBadge story={story} episodeCount={story.episode_count || 0} />
                            <Badge variant="outline" className="text-xs">
                              {languageLabels[story.language] || story.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground/70">
                              {story.episode_count || 0} episode{(story.episode_count || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Published Status */}
                      <td className="p-3">
                        <Badge variant={story.is_published ? "default" : "secondary"} className="text-xs">
                          {story.is_published ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                      </td>

                      {/* Homepage Rank */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={currentHomepageRank === null ? "" : currentHomepageRank}
                            onChange={(e) => handleRankChange(story.id, "homepage", e.target.value)}
                            className="w-20 h-8 transition-all"
                            disabled={saving === `${story.id}-homepage` || !story.is_published}
                            placeholder="Unranked"
                            aria-label={`Homepage rank for ${story.title}`}
                            title={!story.is_published ? "Publish story first to set homepage rank" : "Enter homepage rank (lower = higher priority)"}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveRank(story.id, "homepage")}
                            disabled={saving === `${story.id}-homepage` || currentHomepageRank === story.homepage_rank || !story.is_published}
                            className="h-8 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Save homepage rank for ${story.title}`}
                            title={currentHomepageRank === story.homepage_rank ? "No changes to save" : !story.is_published ? "Publish story first" : "Save rank"}
                          >
                            {saving === `${story.id}-homepage` ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                        {hasHomepageCollision && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            <span>Duplicate rank - conflicts with {rankCollisions[currentHomepageRank!]?.filter(t => t !== story.title).slice(0, 1).join(", ")}</span>
                          </p>
                        )}
                        {!story.is_published && (
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Publish to enable ranking
                          </p>
                        )}
                      </td>

                      {/* Banner Toggle */}
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={story.is_banner}
                              onCheckedChange={(checked) => handleToggleBanner(story.id, checked === true)}
                              disabled={saving === story.id || !story.is_published}
                              aria-label={`${story.is_banner ? "Remove from" : "Add to"} banner for ${story.title}`}
                            />
                            <span className={`text-sm transition-colors ${story.is_banner ? "font-medium" : ""}`}>
                              {story.is_banner ? "Yes" : "No"}
                            </span>
                            {!story.is_published && (
                              <span className="text-xs text-muted-foreground/60 ml-1">(publish first)</span>
                            )}
                          </div>
                          {story.is_banner && (
                            <div className="ml-6 space-y-1">
                              <ImageUpload
                                value={bannerImage}
                                onChange={(url) => handleImageUpload(story.id, "banner", url)}
                                folder="banners"
                                label=""
                                required={false}
                              />
                              {!bannerImage && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-in fade-in">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                  <span>Banner image required for banner display</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Banner Rank */}
                      <td className="p-3">
                        {story.is_banner ? (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* New Launch Toggle */}
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={story.is_new_launch}
                              onCheckedChange={(checked) => handleToggleNewLaunch(story.id, checked === true)}
                              disabled={saving === story.id || !story.is_published}
                              aria-label={`${story.is_new_launch ? "Remove from" : "Add to"} new launches for ${story.title}`}
                            />
                            <span className={`text-sm transition-colors ${story.is_new_launch ? "font-medium" : ""}`}>
                              {story.is_new_launch ? "Yes" : "No"}
                            </span>
                            {!story.is_published && (
                              <span className="text-xs text-muted-foreground/60 ml-1">(publish first)</span>
                            )}
                          </div>
                          {story.is_new_launch && (
                            <div className="ml-6 space-y-1">
                              <ImageUpload
                                value={tileImage}
                                onChange={(url) => handleImageUpload(story.id, "tile", url)}
                                folder="tiles"
                                label=""
                                required={false}
                              />
                              {!tileImage && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-in fade-in">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                  <span>Tile image required for new launch display</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* New Launch Rank */}
                      <td className="p-3">
                        {story.is_new_launch ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={currentNewLaunchRank === null ? "" : currentNewLaunchRank}
                              onChange={(e) => handleRankChange(story.id, "newLaunch", e.target.value)}
                              className="w-20 h-8 transition-all"
                              disabled={saving === `${story.id}-newLaunch` || !story.is_new_launch}
                              placeholder="Unranked"
                              aria-label={`New launch rank for ${story.title}`}
                              title="Enter new launch rank (lower = higher priority)"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveRank(story.id, "newLaunch")}
                              disabled={saving === `${story.id}-newLaunch` || currentNewLaunchRank === story.new_launch_rank || !story.is_new_launch}
                              className="h-8 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`Save new launch rank for ${story.title}`}
                              title={currentNewLaunchRank === story.new_launch_rank ? "No changes to save" : !story.is_new_launch ? "Enable new launch first" : "Save rank"}
                            >
                              {saving === `${story.id}-newLaunch` ? (
                                <span className="animate-pulse">...</span>
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStories.length === 0 && (
            <Card className="border-border/60">
              <CardContent className="py-20 text-center space-y-4">
                {stories.length === 0 ? (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Home className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-foreground text-lg font-semibold">No stories yet</p>
                      <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
                        Create your first story to start managing homepage visibility and ranking.
                      </p>
                    </div>
                    <Link href="/stories/new">
                      <Button className="mt-4">
                        Create First Story
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-foreground text-lg font-semibold">No stories match your filters</p>
                      <p className="text-muted-foreground/70 text-sm">
                        Try adjusting your filters to see more stories.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStatusFilter("all");
                        setVisibilityFilter("all");
                        setLanguageFilter("all");
                      }}
                      className="mt-4"
                    >
                      Clear All Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
