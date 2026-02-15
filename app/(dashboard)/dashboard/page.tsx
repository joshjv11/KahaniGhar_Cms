import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowUpDown, BookOpen, FileText, AlertCircle, Clock, Image as ImageIcon } from "lucide-react";
import { StoriesList } from "@/components/story/StoriesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Story } from "@/lib/types/database";

interface StoryWithEpisodeCount extends Story {
  episode_count: number;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
  }

  // Fetch episode counts for all stories
  const storiesWithCounts: StoryWithEpisodeCount[] = await Promise.all(
    (stories || []).map(async (story) => {
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

  // Calculate dashboard stats
  const totalStories = storiesWithCounts.length;
  const publishedCount = storiesWithCounts.filter((s) => s.is_published).length;
  const draftCount = totalStories - publishedCount;
  const storiesWithZeroEpisodes = storiesWithCounts.filter((s) => s.episode_count === 0).length;
  
  // Recently updated (last 7 days) - using created_at as proxy
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyUpdated = storiesWithCounts.filter((story) => {
    const updatedAt = new Date(story.created_at);
    return updatedAt >= sevenDaysAgo;
  }).length;

  // Next Actions: Stories published but missing episodes
  const publishedWithoutEpisodes = storiesWithCounts.filter(
    (s) => s.is_published && s.episode_count === 0
  );

  // Next Actions: Drafts not updated in 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const staleDrafts = storiesWithCounts.filter((story) => {
    if (story.is_published) return false;
    const updatedAt = new Date(story.created_at);
    return updatedAt < thirtyDaysAgo;
  });

  // Next Actions: Homepage stories missing images
  const homepageStoriesMissingImages = storiesWithCounts.filter(
    (s) => (s.is_banner && !s.banner_image_url) || (s.is_new_launch && !s.tile_image_url)
  );

  // Get recently updated stories (last 7 days) for display
  const recentlyUpdatedStories = storiesWithCounts
    .filter((story) => {
      const updatedAt = new Date(story.created_at);
      return updatedAt >= sevenDaysAgo;
    })
    .slice(0, 12); // Limit to 12 for display

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl animate-in fade-in duration-300 relative">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-primary/10 dark:bg-blue-primary/20 rounded-full blur-3xl -z-10" />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary bg-clip-text text-transparent animate-blue-gold-gradient">Overview</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          System snapshot and content management
        </p>
      </div>

      {/* Dashboard Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-100/90 via-gold-100/40 to-blue-100/90 dark:from-blue-900/40 dark:via-gold-900/20 dark:to-blue-900/40 border-2 border-blue-primary/50 dark:border-blue-primary/40 hover:border-gold-500/60 dark:hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/30 dark:hover:shadow-gold-500/20 transition-all duration-300 transform hover:scale-[1.02] gpu-accelerated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-primary dark:text-blue-400">Total Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-primary to-gold-500 bg-clip-text text-transparent">{totalStories}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-100/90 via-gold-100/30 to-emerald-100/90 dark:from-emerald-900/30 dark:via-gold-900/15 dark:to-emerald-900/30 border-2 border-emerald-500/40 dark:border-emerald-500/30 hover:border-gold-500/60 dark:hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/30 dark:hover:shadow-gold-500/20 transition-all duration-300 transform hover:scale-[1.02] gpu-accelerated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Published vs Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              <span className="text-emerald-600">{publishedCount}</span>
              <span className="text-slate-400 mx-2">/</span>
              <span className="text-slate-500">{draftCount}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Published / Draft
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gold-200/90 via-amber-200/50 to-gold-200/90 dark:from-gold-900/40 dark:via-amber-900/25 dark:to-gold-900/40 border-2 border-gold-500/60 dark:border-gold-500/50 hover:border-gold-500/80 dark:hover:border-gold-500/70 hover:shadow-2xl hover:shadow-gold-500/40 dark:hover:shadow-gold-500/30 transition-all duration-300 transform hover:scale-[1.02] gpu-accelerated animate-gold-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gold-700 dark:text-gold-400">Stories with 0 Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gold-600 dark:text-gold-500">{storiesWithZeroEpisodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100/90 via-purple-100/30 to-blue-100/90 dark:from-blue-900/40 dark:via-purple-900/20 dark:to-blue-900/40 border-2 border-blue-primary/50 dark:border-blue-primary/40 hover:border-gold-500/60 dark:hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/30 dark:hover:shadow-gold-500/20 transition-all duration-300 transform hover:scale-[1.02] gpu-accelerated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-primary dark:text-blue-400">Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-primary to-gold-500 bg-clip-text text-transparent">{recentlyUpdated}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions Panel */}
      {(publishedWithoutEpisodes.length > 0 || staleDrafts.length > 0 || homepageStoriesMissingImages.length > 0) && (
        <Card className="mb-8 border-2 border-gold-500/50 dark:border-gold-500/40 bg-gradient-to-br from-gold-100/70 via-amber-100/40 to-gold-100/70 dark:from-gold-900/30 dark:via-amber-900/20 dark:to-gold-900/30 hover:border-gold-500/70 dark:hover:border-gold-500/60 hover:shadow-2xl hover:shadow-gold-500/30 dark:hover:shadow-gold-500/20 transition-all duration-300 transform hover:scale-[1.01] gpu-accelerated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold-700 dark:text-gold-400">
              <AlertCircle className="h-5 w-5 text-gold-600 dark:text-gold-500" />
              Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {publishedWithoutEpisodes.length > 0 && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {publishedWithoutEpisodes.length} published {publishedWithoutEpisodes.length === 1 ? "story" : "stories"} missing episodes
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {publishedWithoutEpisodes.slice(0, 3).map((s) => s.title).join(", ")}
                    {publishedWithoutEpisodes.length > 3 && ` +${publishedWithoutEpisodes.length - 3} more`}
                  </p>
                </div>
              </div>
            )}

            {staleDrafts.length > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {staleDrafts.length} draft {staleDrafts.length === 1 ? "story" : "stories"} not updated in 30+ days
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {staleDrafts.slice(0, 3).map((s) => s.title).join(", ")}
                    {staleDrafts.length > 3 && ` +${staleDrafts.length - 3} more`}
                  </p>
                </div>
              </div>
            )}

            {homepageStoriesMissingImages.length > 0 && (
              <div className="flex items-start gap-3">
                <ImageIcon className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {homepageStoriesMissingImages.length} homepage {homepageStoriesMissingImages.length === 1 ? "story" : "stories"} missing images
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {homepageStoriesMissingImages.slice(0, 3).map((s) => s.title).join(", ")}
                    {homepageStoriesMissingImages.length > 3 && ` +${homepageStoriesMissingImages.length - 3} more`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recently Updated Stories */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-100">Recently Updated Stories</h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Quick access to recently modified content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ranking-visibility">
            <Button variant="outline" soundType="click" playHoverSound>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Manage Rankings
            </Button>
          </Link>
        <Link href="/stories/new">
            <Button 
              variant="outline" 
              soundType="success" 
              playHoverSound
              className="bg-gradient-to-r from-gold-100 to-gold-50 dark:from-gold-900/30 dark:to-gold-800/20 border-2 border-gold-500/50 dark:border-gold-500/40 text-slate-900 dark:text-slate-100 font-semibold hover:from-gold-200 hover:to-gold-100 dark:hover:from-gold-800/40 dark:hover:to-gold-700/30 hover:border-gold-600 dark:hover:border-gold-500 hover:shadow-xl hover:shadow-gold-500/30"
            >
            <Plus className="h-4 w-4 mr-2" />
            Add New Story
          </Button>
        </Link>
        </div>
      </div>

      <StoriesList initialStories={recentlyUpdatedStories} />
    </div>
  );
}
