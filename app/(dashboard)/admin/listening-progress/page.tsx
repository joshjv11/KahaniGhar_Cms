import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CheckCircle, Clock } from "lucide-react";

export default async function AdminListeningProgressPage() {
  const supabase = await createClient();

  // Fetch listening progress
  const { data: progress, error: progressError } = await supabase
    .from("listening_progress")
    .select("*")
    .order("last_listened_at", { ascending: false })
    .limit(100);

  if (progressError) {
    console.error("Error fetching listening progress:", progressError);
  }

  // Fetch related data
  const progressWithDetails = await Promise.all(
    (progress || []).map(async (item) => {
      const [childResult, storyResult, episodeResult] = await Promise.all([
        supabase
          .from("child_profiles")
          .select("name, alias")
          .eq("id", item.child_profile_id)
          .single(),
        item.story_id
          ? supabase
              .from("stories")
              .select("title")
              .eq("id", item.story_id)
              .single()
          : { data: null },
        item.episode_id
          ? supabase
              .from("episodes")
              .select("title")
              .eq("id", item.episode_id)
              .single()
          : { data: null },
      ]);

      return {
        ...item,
        child_name: childResult.data?.name || childResult.data?.alias || "Unknown Child",
        story_title: storyResult.data?.title || null,
        episode_title: episodeResult.data?.title || null,
      };
    })
  );

  // Calculate summary stats
  const totalListens = progress?.length || 0;
  const completedCount = progress?.filter((p) => p.is_completed || p.progress_percentage === 100).length || 0;

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Listening Progress" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Listening Progress</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read-only view of listening activity across the system
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{totalListens}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{totalListens - completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {!progress || progress.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No listening data yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {progressWithDetails.map((item) => {
            const isCompleted = item.is_completed || item.progress_percentage === 100;
            const progressValue = item.progress_percentage ?? 0;

            return (
              <Card key={item.id} className="border-border/60 hover:border-border transition-all hover:shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-lg font-semibold leading-tight">{item.child_name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCompleted ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {progressValue}% Complete
                          </Badge>
                        )}
                        {item.story_title && (
                          <Badge variant="outline">Story: {item.story_title}</Badge>
                        )}
                        {item.episode_title && (
                          <Badge variant="outline">Episode: {item.episode_title}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {!isCompleted && progressValue > 0 && (
                      <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-xs text-muted-foreground/80">
                      {item.last_listened_at && (
                        <span>
                          Last listened {new Date(item.last_listened_at).toLocaleString()}
                        </span>
                      )}
                    </div>
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
