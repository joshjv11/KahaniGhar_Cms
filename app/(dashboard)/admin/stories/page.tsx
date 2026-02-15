import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Eye, EyeOff, ArrowUpDown } from "lucide-react";

export default async function AdminStoriesPage() {
  const supabase = await createClient();

  // Fetch stories with episode counts
  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (storiesError) {
    console.error("Error fetching stories:", storiesError);
  }

  // Fetch episode counts for each story
  const storiesWithCounts = await Promise.all(
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

  const languageLabels: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
  };

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Stories" }]} />
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Stories</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Read-only view of all stories in the system
            </p>
          </div>
          <Link href="/admin/ranking-visibility">
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Manage Rankings
            </Button>
          </Link>
        </div>
      </div>

      {!stories || stories.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No stories found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {storiesWithCounts.map((story) => {
            const isHomepageEnabled =
              story.is_banner ||
              story.is_new_launch ||
              (story.homepage_rank !== null && story.homepage_rank !== undefined);

            return (
              <Card key={story.id} className="border-border/60 hover:border-border transition-all hover:shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-lg font-semibold leading-tight">{story.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={story.is_published ? "default" : "secondary"}
                          className={story.is_published ? "font-semibold" : "font-semibold"}
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
                        <Badge variant="outline" className="font-semibold">
                          {languageLabels[story.language] || story.language}
                        </Badge>
                        {isHomepageEnabled && (
                          <Badge variant="outline" className="border-2 border-blue-500/60 dark:border-blue-500/50 bg-blue-100/50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold">
                            <Home className="h-3 w-3 mr-1" />
                            Homepage
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground/70 font-medium">
                          {story.episode_count} episode{story.episode_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {story.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{story.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-xs text-muted-foreground/80">
                      <span>
                        Created {new Date(story.created_at).toLocaleDateString()}
                      </span>
                      {story.release_date && (
                        <span>
                          Released {new Date(story.release_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {isHomepageEnabled && (
                      <div className="pt-3 border-t border-border/40">
                        <p className="text-xs text-muted-foreground/70">
                          Homepage:{" "}
                          {story.is_banner && "Banner "}
                          {story.is_new_launch && "New Launch "}
                          {story.homepage_rank !== null && `Rank ${story.homepage_rank}`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
