import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { User, Globe } from "lucide-react";

export default async function AdminChildProfilesPage() {
  const supabase = await createClient();

  // Fetch child profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("child_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching child profiles:", profilesError);
  }

  // Fetch listening activity counts
  const profilesWithActivity = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { count } = await supabase
        .from("listening_progress")
        .select("*", { count: "exact", head: true })
        .eq("child_profile_id", profile.id);

      return {
        ...profile,
        listening_count: count || 0,
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
      <Breadcrumb items={[{ label: "Child Profiles" }]} />
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Child Profiles</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read-only view of child profiles (privacy-respecting)
        </p>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground/70 text-base">No child profiles found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profilesWithActivity.map((profile) => (
            <Card key={profile.id} className="border-border/60 hover:border-border transition-all hover:shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <CardTitle className="text-lg font-semibold leading-tight flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {profile.name || profile.alias || "Unnamed Profile"}
                    </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                      {profile.language_preference && (
                        <Badge variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          {languageLabels[profile.language_preference] || profile.language_preference}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {profile.listening_count} listening session{profile.listening_count !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-xs text-muted-foreground/80">
                    <span>
                      Created {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                    {profile.updated_at && (
                      <span>
                        Updated {new Date(profile.updated_at).toLocaleDateString()}
                      </span>
                    )}
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
