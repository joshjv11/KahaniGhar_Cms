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
import { playSound } from "@/lib/utils/sounds";
import { motion } from "framer-motion";

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
    
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (typeof window !== 'undefined') {
        try {
          playSound('click');
        } catch (e) {
          // Silently fail
        }
      }
    };
    
    // Listen for first user interaction
    const events = ['mousedown', 'touchstart', 'keydown'];
    const initOnce = () => {
      initAudio();
      events.forEach(e => document.removeEventListener(e, initOnce));
    };
    
    events.forEach(e => document.addEventListener(e, initOnce, { once: true }));
    
    return () => {
      events.forEach(e => document.removeEventListener(e, initOnce));
    };
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
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-6 max-w-[1800px] relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-primary/10 dark:bg-blue-primary/20 rounded-full blur-3xl -z-10" />
        <Breadcrumb items={[{ label: "Ranking & Visibility" }]} />
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2 text-slate-900">
            Ranking & Visibility
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Control homepage ordering, banner inclusion, and new launch placement
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Explanation Card */}
          <Card className="border border-blue-primary/20 dark:border-blue-primary/10 bg-white/70 dark:bg-navy/70 backdrop-blur-sm lg:col-span-2 hover:shadow-lg hover:border-gold-500/30 dark:hover:border-gold-500/20 transition-all duration-300 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-primary dark:text-blue-400 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  How this works
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-none">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-500 dark:text-gold-400 font-bold mt-0.5 text-xs">•</span>
                    <span><strong className="text-slate-800 dark:text-slate-200">Homepage Rank:</strong> Lower numbers appear first. Unranked stories won&apos;t appear.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-500 dark:text-gold-400 font-bold mt-0.5 text-xs">•</span>
                    <span><strong className="text-slate-800 dark:text-slate-200">Banner:</strong> Requires a banner image. Enable/disable instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-500 dark:text-gold-400 font-bold mt-0.5 text-xs">•</span>
                    <span><strong className="text-slate-800 dark:text-slate-200">New Launches:</strong> Requires a tile image. Each can have its own ranking.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Homepage Preview */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <HomepagePreview stories={stories} />
          </motion.div>
        </motion.div>

        {/* Safety Warnings */}
        {!loading && (
          <div className="mb-6">
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <Card className="border border-blue-primary/20 dark:border-blue-primary/10 bg-white/80 dark:bg-navy/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-gold-500/30 dark:hover:border-gold-500/20 transition-all duration-300">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-blue-primary dark:text-blue-400">Status:</label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value: any) => {
                      playSound('toggle');
                      setStatusFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-32 h-9 border-2 border-blue-primary/30 dark:border-blue-primary/20 hover:border-gold-500/50 dark:hover:border-gold-500/40 transition-all text-sm">
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
                  <label className="text-xs font-medium text-slate-600">Visibility:</label>
                  <Select 
                    value={visibilityFilter} 
                    onValueChange={(value: any) => {
                      playSound('toggle');
                      setVisibilityFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-40 h-9 border border-slate-300 hover:border-blue-400 transition-all text-sm">
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
                  <label className="text-xs font-medium text-slate-600">Language:</label>
                  <Select 
                    value={languageFilter} 
                    onValueChange={(value: any) => {
                      playSound('toggle');
                      setLanguageFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-32 h-9 border-2 border-blue-primary/30 dark:border-blue-primary/20 hover:border-gold-500/50 dark:hover:border-gold-500/40 transition-all text-sm">
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
                <div className="ml-auto text-xs font-medium text-blue-primary dark:text-blue-400 bg-blue-primary/10 dark:bg-blue-primary/5 border border-gold-500/20 dark:border-gold-500/10 px-2.5 py-1.5 rounded-md">
                  Showing <span className="font-semibold text-gold-500 dark:text-gold-400">{filteredStories.length}</span> of <span className="font-semibold text-blue-primary dark:text-blue-400">{stories.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <Card className="border border-blue-primary/20 dark:border-blue-primary/10 bg-white/90 dark:bg-navy/90 backdrop-blur-sm shadow-md hover:border-gold-500/30 dark:hover:border-gold-500/20 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-blue-primary/30 dark:border-blue-primary/20 bg-gradient-to-r from-blue-primary/10 via-gold-500/5 to-blue-primary/10 dark:from-blue-primary/5 dark:via-gold-500/3 dark:to-blue-primary/5">
                    <th className="text-left p-3 text-xs font-bold text-blue-primary dark:text-blue-400 uppercase tracking-wider">Story</th>
                    <th className="text-left p-3 text-xs font-bold text-blue-primary dark:text-blue-400 uppercase tracking-wider">Status</th>
                    <th className="text-left p-3 text-xs font-bold text-blue-primary dark:text-blue-400 uppercase tracking-wider">Homepage Rank</th>
                    <th className="text-left p-3 text-xs font-bold text-blue-primary dark:text-blue-400 uppercase tracking-wider">Banner</th>
                    <th className="text-left p-3 text-xs font-bold text-blue-primary dark:text-blue-400 uppercase tracking-wider">Banner Rank</th>
                    <th className="text-left p-3 text-xs font-bold text-gold-500 dark:text-gold-400 uppercase tracking-wider">New Launch</th>
                    <th className="text-left p-3 text-xs font-bold text-gold-500 dark:text-gold-400 uppercase tracking-wider">New Launch Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map((story, index) => {
                  const currentHomepageRank = editingRanks[story.id]?.homepage ?? story.homepage_rank;
                  const currentNewLaunchRank = editingRanks[story.id]?.newLaunch ?? story.new_launch_rank;
                  const hasHomepageCollision = currentHomepageRank !== null && rankCollisions[currentHomepageRank]?.includes(story.title);
                  const bannerImage = bannerImageUrls[story.id] || story.banner_image_url || "";
                  const tileImage = tileImageUrls[story.id] || story.tile_image_url || "";

                    return (
                      <tr 
                        key={story.id} 
                        className="border-b border-blue-primary/10 dark:border-blue-primary/5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-gold-50/20 hover:to-blue-50/50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/15 dark:hover:to-blue-950/30 transition-all duration-300 ease-out-smooth group gpu-accelerated"
                        aria-label={`Story: ${story.title}`}
                        style={{ willChange: 'background-color' }}
                      >
                        {/* Story Info */}
                        <td className="p-3">
                          <div className="space-y-1.5">
                            <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                              {story.title}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <ContentStateBadge story={story} episodeCount={story.episode_count || 0} />
                              <Badge variant="outline" className="text-xs border-slate-200 bg-slate-50">
                                {languageLabels[story.language] || story.language}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {story.episode_count || 0} ep{(story.episode_count || 0) !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Published Status */}
                        <td className="p-3">
                          <Badge 
                            variant={story.is_published ? "default" : "secondary"} 
                            className={`text-xs font-semibold ${
                              story.is_published 
                                ? "bg-emerald-200 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-400 dark:border-emerald-600" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-400 dark:border-slate-600"
                            }`}
                          >
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
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              value={currentHomepageRank === null ? "" : currentHomepageRank}
                              onChange={(e) => handleRankChange(story.id, "homepage", e.target.value)}
                              className="w-16 h-8 text-sm transition-all border-slate-200"
                              disabled={saving === `${story.id}-homepage` || !story.is_published}
                              placeholder="—"
                              aria-label={`Homepage rank for ${story.title}`}
                              title={!story.is_published ? "Publish story first to set homepage rank" : "Enter homepage rank (lower = higher priority)"}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                playSound('save');
                                handleSaveRank(story.id, "homepage");
                              }}
                              disabled={saving === `${story.id}-homepage` || currentHomepageRank === story.homepage_rank || !story.is_published}
                              className="h-8 px-2 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-200"
                              aria-label={`Save homepage rank for ${story.title}`}
                              title={currentHomepageRank === story.homepage_rank ? "No changes to save" : !story.is_published ? "Publish story first" : "Save rank"}
                              soundType="save"
                              playHoverSound
                            >
                              {saving === `${story.id}-homepage` ? (
                                <span className="animate-pulse text-xs">...</span>
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
                              onCheckedChange={(checked) => {
                                playSound('toggle');
                                handleToggleBanner(story.id, checked === true);
                              }}
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
                            <span className="text-xs text-slate-400">N/A</span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* New Launch Toggle */}
                        <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={story.is_new_launch}
                              onCheckedChange={(checked) => {
                                playSound('toggle');
                                handleToggleNewLaunch(story.id, checked === true);
                              }}
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
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min="0"
                                value={currentNewLaunchRank === null ? "" : currentNewLaunchRank}
                                onChange={(e) => handleRankChange(story.id, "newLaunch", e.target.value)}
                                className="w-16 h-8 text-sm transition-all border-slate-200"
                                disabled={saving === `${story.id}-newLaunch` || !story.is_new_launch}
                                placeholder="—"
                                aria-label={`New launch rank for ${story.title}`}
                                title="Enter new launch rank (lower = higher priority)"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  playSound('save');
                                  handleSaveRank(story.id, "newLaunch");
                                }}
                                disabled={saving === `${story.id}-newLaunch` || currentNewLaunchRank === story.new_launch_rank || !story.is_new_launch}
                                className="h-8 px-2 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-200"
                                aria-label={`Save new launch rank for ${story.title}`}
                                title={currentNewLaunchRank === story.new_launch_rank ? "No changes to save" : !story.is_new_launch ? "Enable new launch first" : "Save rank"}
                                soundType="save"
                                playHoverSound
                              >
                                {saving === `${story.id}-newLaunch` ? (
                                  <span className="animate-pulse text-xs">...</span>
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
          </Card>
        </motion.div>

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
    </div>
  );
}
