import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { AdminStoriesView } from "@/components/story/AdminStoriesView";

export default async function AdminStoriesPage() {
  const supabase = await createClient();

  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (storiesError) {
    console.error("Error fetching stories:", storiesError);
  }

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

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <Breadcrumb items={[{ label: "Stories" }]} />
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Stories</h1>
            <p className="text-slate-400 text-base">
              View and manage all stories
            </p>
          </div>
          <Link href="/admin/ranking-visibility">
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Manage Rankings
            </Button>
          </Link>
        </div>
      </div>

      <AdminStoriesView stories={storiesWithCounts} />
    </div>
  );
}
