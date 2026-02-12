import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils/cn";
import { MessageSquare, BookOpen, FileText, Clock } from "lucide-react";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  // Fetch feedback messages
  const { data: feedback, error: feedbackError } = await supabase
    .from("feedback_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (feedbackError) {
    console.error("Error fetching feedback:", feedbackError);
  }

  // Fetch related data
  const feedbackWithDetails = await Promise.all(
    (feedback || []).map(async (item) => {
      const [storyResult, episodeResult] = await Promise.all([
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
        story_title: storyResult.data?.title || null,
        episode_title: episodeResult.data?.title || null,
      };
    })
  );

  // Calculate stats
  const totalFeedback = feedback?.length || 0;
  const recentFeedback = feedback?.filter(
    (f) => new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  const isRecent = (date: string) => {
    return new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  };

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Feedback Messages" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Feedback Messages</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read-only view of user feedback and messages
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{totalFeedback}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{recentFeedback}</p>
          </CardContent>
        </Card>
      </div>

      {!feedback || feedback.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No feedback submitted</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbackWithDetails.map((item) => {
            const recent = isRecent(item.created_at);
            const messagePreview = item.message
              ? item.message.length > 150
                ? item.message.substring(0, 150) + "..."
                : item.message
              : "No message content";

            return (
              <Card
                key={item.id}
                className={cn(
                  "border-border/60 hover:border-border transition-all hover:shadow-sm",
                  recent ? "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/10" : ""
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg font-semibold">Feedback Message</CardTitle>
                        {recent && (
                          <Badge variant="default" className="bg-blue-600 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.story_title && (
                          <Badge variant="outline">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Story: {item.story_title}
                          </Badge>
                        )}
                        {item.episode_title && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Episode: {item.episode_title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{messagePreview}</p>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground/80">
                      <span>
                        Submitted {new Date(item.created_at).toLocaleString()}
                      </span>
                      {item.user_email && (
                        <span>From {item.user_email}</span>
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
