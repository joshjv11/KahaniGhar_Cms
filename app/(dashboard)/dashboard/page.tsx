import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  ArrowUpDown,
  FileText,
  AlertCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Story } from "@/lib/types/database";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { SparklineCard } from "@/components/dashboard/SparklineCard";
import { RecentStoriesCarousel } from "@/components/dashboard/RecentStoriesCarousel";

interface StoryWithEpisodeCount extends Story {
  episode_count: number;
}

function getLast7DaysTrend(stories: StoryWithEpisodeCount[]) {
  const days: { name: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const label = dayStart.toLocaleDateString("en-US", { weekday: "short" });
    const count = stories.filter((s) => {
      const created = new Date(s.created_at);
      return created >= dayStart && created <= dayEnd;
    }).length;
    days.push({ name: label, value: count });
  }
  return days;
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

  const totalStories = storiesWithCounts.length;
  const publishedCount = storiesWithCounts.filter((s) => s.is_published).length;
  const draftCount = totalStories - publishedCount;
  const storiesWithZeroEpisodes = storiesWithCounts.filter(
    (s) => s.episode_count === 0
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyUpdated = storiesWithCounts.filter((story) => {
    const updatedAt = new Date(story.created_at);
    return updatedAt >= sevenDaysAgo;
  }).length;

  const publishedWithoutEpisodes = storiesWithCounts.filter(
    (s) => s.is_published && s.episode_count === 0
  );
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const staleDrafts = storiesWithCounts.filter((story) => {
    if (story.is_published) return false;
    const updatedAt = new Date(story.created_at);
    return updatedAt < thirtyDaysAgo;
  });
  const homepageStoriesMissingImages = storiesWithCounts.filter(
    (s) =>
      (s.is_banner && !s.banner_image_url) ||
      (s.is_new_launch && !s.tile_image_url)
  );

  const recentlyUpdatedStories = storiesWithCounts
    .filter((story) => {
      const updatedAt = new Date(story.created_at);
      return updatedAt >= sevenDaysAgo;
    })
    .slice(0, 12);

  const trendData = getLast7DaysTrend(storiesWithCounts);

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl animate-in fade-in duration-300 relative">
      <DashboardGreeting draftCount={draftCount} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalStories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Published / Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              <span className="text-emerald-400">{publishedCount}</span>
              <span className="text-slate-500 mx-2">/</span>
              <span className="text-slate-400">{draftCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Stories with 0 Episodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              {storiesWithZeroEpisodes}
            </div>
          </CardContent>
        </Card>

        <SparklineCard
          title="Recently Updated"
          value={recentlyUpdated}
          subLabel="Last 7 days"
          data={trendData}
          valueClassName="text-[#FFB800]"
        />
      </div>

      {(publishedWithoutEpisodes.length > 0 ||
        staleDrafts.length > 0 ||
        homepageStoriesMissingImages.length > 0) && (
        <Card className="mb-8 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400 text-base">
              <AlertCircle className="h-4 w-4" />
              Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {publishedWithoutEpisodes.length > 0 && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    {publishedWithoutEpisodes.length} published story
                    {publishedWithoutEpisodes.length !== 1 ? "ies" : ""} missing
                    episodes
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {publishedWithoutEpisodes
                      .slice(0, 3)
                      .map((s) => s.title)
                      .join(", ")}
                    {publishedWithoutEpisodes.length > 3 &&
                      ` +${publishedWithoutEpisodes.length - 3} more`}
                  </p>
                </div>
              </div>
            )}
            {staleDrafts.length > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    {staleDrafts.length} draft not updated in 30+ days
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {staleDrafts
                      .slice(0, 3)
                      .map((s) => s.title)
                      .join(", ")}
                    {staleDrafts.length > 3 &&
                      ` +${staleDrafts.length - 3} more`}
                  </p>
                </div>
              </div>
            )}
            {homepageStoriesMissingImages.length > 0 && (
              <div className="flex items-start gap-3">
                <ImageIcon className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    {homepageStoriesMissingImages.length} homepage story
                    {homepageStoriesMissingImages.length !== 1 ? "ies" : ""}{" "}
                    missing images
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {homepageStoriesMissingImages
                      .slice(0, 3)
                      .map((s) => s.title)
                      .join(", ")}
                    {homepageStoriesMissingImages.length > 3 &&
                      ` +${homepageStoriesMissingImages.length - 3} more`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-3">
          <Link href="/admin/ranking-visibility">
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Manage Rankings
            </Button>
          </Link>
          <Link href="/stories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Story
            </Button>
          </Link>
        </div>
      </div>

      <RecentStoriesCarousel stories={recentlyUpdatedStories} />
    </div>
  );
}
