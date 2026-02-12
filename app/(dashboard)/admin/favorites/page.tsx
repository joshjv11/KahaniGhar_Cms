import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heart, BookOpen, FileText } from "lucide-react";

export default async function AdminFavoritesPage() {
  const supabase = await createClient();

  // Fetch favorites
  const { data: favorites, error: favoritesError } = await supabase
    .from("user_favorites")
    .select("*")
    .order("created_at", { ascending: false });

  if (favoritesError) {
    console.error("Error fetching favorites:", favoritesError);
  }

  // Fetch related data and aggregate
  const favoritesWithDetails = await Promise.all(
    (favorites || []).map(async (favorite) => {
      const [childResult, storyResult, episodeResult] = await Promise.all([
        supabase
          .from("child_profiles")
          .select("name, alias")
          .eq("id", favorite.child_profile_id)
          .single(),
        favorite.story_id
          ? supabase
              .from("stories")
              .select("title")
              .eq("id", favorite.story_id)
              .single()
          : { data: null },
        favorite.episode_id
          ? supabase
              .from("episodes")
              .select("title")
              .eq("id", favorite.episode_id)
              .single()
          : { data: null },
      ]);

      return {
        ...favorite,
        child_name: childResult.data?.name || childResult.data?.alias || "Unknown Child",
        story_title: storyResult.data?.title || null,
        episode_title: episodeResult.data?.title || null,
      };
    })
  );

  // Aggregate most favorited items
  const storyFavorites = favoritesWithDetails.filter((f) => f.story_id);
  const episodeFavorites = favoritesWithDetails.filter((f) => f.episode_id);

  const storyCounts = storyFavorites.reduce((acc, f) => {
    if (f.story_title) {
      acc[f.story_title] = (acc[f.story_title] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const episodeCounts = episodeFavorites.reduce((acc, f) => {
    if (f.episode_title) {
      acc[f.episode_title] = (acc[f.episode_title] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topStories = Object.entries(storyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const topEpisodes = Object.entries(episodeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Favorites" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Favorites</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read-only view of user favorites and popular content
        </p>
      </div>

      {/* Aggregated View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Most Favorited Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStories.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">No story favorites yet</p>
            ) : (
              <div className="space-y-3">
                {topStories.map(([title, count]) => (
                  <div key={title} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{title}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Most Favorited Episodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topEpisodes.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">No episode favorites yet</p>
            ) : (
              <div className="space-y-3">
                {topEpisodes.map(([title, count]) => (
                  <div key={title} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{title}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">All Favorites</h2>
        <p className="text-sm text-muted-foreground/70">Complete list of user favorites</p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No favorites found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favoritesWithDetails.map((favorite) => (
            <Card key={favorite.id} className="border-border/60 hover:border-border transition-all hover:shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <CardTitle className="text-lg font-semibold leading-tight flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {favorite.child_name}
                    </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                      {favorite.story_title && (
                        <Badge variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Story: {favorite.story_title}
                        </Badge>
                      )}
                      {favorite.episode_title && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Episode: {favorite.episode_title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground/80">
                  <span>
                    Favorited {new Date(favorite.created_at).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
