import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Eye, EyeOff, Music, Image } from "lucide-react";

export default async function AdminEpisodesPage() {
  const supabase = await createClient();

  // Fetch episodes with story information
  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("*")
    .order("created_at", { ascending: false });

  if (episodesError) {
    console.error("Error fetching episodes:", episodesError);
  }

  // Fetch story titles for each episode
  const episodesWithStories = await Promise.all(
    (episodes || []).map(async (episode) => {
      const { data: story } = await supabase
        .from("stories")
        .select("title")
        .eq("id", episode.story_id)
        .single();

      const slidesCount = Array.isArray(episode.slides) ? episode.slides.length : 0;
      const hasAudio = !!episode.audio_url;

      return {
        ...episode,
        story_title: story?.title || "Unknown Story",
        slides_count: slidesCount,
        has_audio: hasAudio,
      };
    })
  );

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Episodes" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Episodes</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read-only view of all episodes in the system
        </p>
      </div>

      {!episodes || episodes.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No episodes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodesWithStories.map((episode) => (
            <Card key={episode.id} className="border-border/60 hover:border-border transition-all hover:shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <CardTitle className="text-lg font-semibold leading-tight">{episode.title}</CardTitle>
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
                            Draft
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">{episode.story_title}</Badge>
                      {episode.episode_number !== null && (
                        <Badge variant="outline">Episode {episode.episode_number}</Badge>
                      )}
                      {episode.has_audio ? (
                        <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                          <Music className="h-3 w-3 mr-1" />
                          Audio
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-700 dark:text-red-400">
                          No Audio
                        </Badge>
                      )}
                      {episode.slides_count > 0 ? (
                        <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                          <Image className="h-3 w-3 mr-1" />
                          {episode.slides_count} slide{episode.slides_count !== 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                          No Slides
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {episode.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{episode.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-xs text-muted-foreground/80">
                    <span>
                      Created {new Date(episode.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
