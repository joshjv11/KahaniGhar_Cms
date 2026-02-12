import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowUpDown } from "lucide-react";
import { StoriesList } from "@/components/story/StoriesList";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from("stories")
    .select("*")
    .order("homepage_rank", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
  }

  return (
    <div className="container mx-auto py-10 px-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Overview</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          System snapshot and content management
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Stories</h2>
          <p className="text-muted-foreground text-sm">
            Manage your story content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ranking-visibility">
            <Button variant="outline">
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

      <StoriesList initialStories={stories || []} />
    </div>
  );
}
