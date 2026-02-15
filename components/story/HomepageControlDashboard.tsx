"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/upload/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Story } from "@/lib/types/database";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const homepageSchema = z.object({
  is_banner: z.boolean().default(false),
  is_new_launch: z.boolean().default(false),
  banner_image_url: z.string().optional(),
  tile_image_url: z.string().optional(),
  // Rank fields removed - managed in dedicated Rank Management page
}).refine((data) => {
  if (data.is_banner && !data.banner_image_url) {
    return false;
  }
  return true;
}, {
  message: "Banner image is required when adding to homepage banner",
  path: ["banner_image_url"],
}).refine((data) => {
  if (data.is_new_launch && !data.tile_image_url) {
    return false;
  }
  return true;
}, {
  message: "Tile image is required when adding to new launches",
  path: ["tile_image_url"],
});

type HomepageFormData = z.infer<typeof homepageSchema>;

interface HomepageControlDashboardProps {
  story: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data?: HomepageFormData) => void | Promise<void>;
  isNewStory?: boolean;
}

export function HomepageControlDashboard({
  story,
  open,
  onOpenChange,
  onSave,
  isNewStory = false,
}: HomepageControlDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState(story.banner_image_url || "");
  const [tileImageUrl, setTileImageUrl] = useState(story.tile_image_url || "");
  const [episodesCount, setEpisodesCount] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<HomepageFormData>({
    resolver: zodResolver(homepageSchema),
    defaultValues: {
      is_banner: story.is_banner || false,
      is_new_launch: story.is_new_launch || false,
      banner_image_url: story.banner_image_url || "",
      tile_image_url: story.tile_image_url || "",
    },
  });

  const isBanner = watch("is_banner");
  const isNewLaunch = watch("is_new_launch");
  const bannerImageUrlForm = watch("banner_image_url");
  const tileImageUrlForm = watch("tile_image_url");

  // Determine homepage eligibility - enabled if any homepage feature is active
  const homepageEligibilityEnabled = isBanner || isNewLaunch;
  const isPublished = story.is_published;
  
  // Track if user wants to enable homepage (separate from current state)
  const [enableHomepage, setEnableHomepage] = useState(homepageEligibilityEnabled);

  // Fetch episodes count
  useEffect(() => {
    if (open && story.id) {
      const fetchEpisodes = async () => {
        const supabase = createClient();
        const { count } = await supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .eq("story_id", story.id);
        setEpisodesCount(count || 0);
      };
      fetchEpisodes();
    }
  }, [open, story.id]);

  // Track unsaved changes
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    setValue("banner_image_url", bannerImageUrl);
  }, [bannerImageUrl, setValue]);

  useEffect(() => {
    setValue("tile_image_url", tileImageUrl);
  }, [tileImageUrl, setValue]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const hasHomepageConfig = story.is_banner || story.is_new_launch;
      reset({
        is_banner: story.is_banner || false,
        is_new_launch: story.is_new_launch || false,
        banner_image_url: story.banner_image_url || "",
        tile_image_url: story.tile_image_url || "",
      });
      setBannerImageUrl(story.banner_image_url || "");
      setTileImageUrl(story.tile_image_url || "");
      setEnableHomepage(hasHomepageConfig);
      setHasUnsavedChanges(false);
    }
  }, [open, story, reset]);

  const onSubmit = async (data: HomepageFormData) => {
    setLoading(true);

    try {

      // Ensure nullable string fields are null, not undefined or empty string
      const bannerImageUrlValue = data.banner_image_url && data.banner_image_url.trim() !== "" 
        ? data.banner_image_url 
        : null;
      const tileImageUrlValue = data.tile_image_url && data.tile_image_url.trim() !== "" 
        ? data.tile_image_url 
        : null;

      if (isNewStory || !story.id) {
        // For new stories, pass form data to parent to update form state
        await onSave({
          is_banner: data.is_banner ?? false,
          is_new_launch: data.is_new_launch ?? false,
          banner_image_url: bannerImageUrlValue || undefined,
          tile_image_url: tileImageUrlValue || undefined,
        });
        
        toast({
          title: "Settings saved to form",
          description: "Homepage settings will be applied when you save the story.",
        });

        setHasUnsavedChanges(false);
        onOpenChange(false);
      } else {
        // For existing stories, save to database
        const supabase = createClient();

        const { error } = await supabase
          .from("stories")
          .update({
            is_banner: data.is_banner ?? false,
            is_new_launch: data.is_new_launch ?? false,
          banner_image_url: bannerImageUrlValue,
          tile_image_url: tileImageUrlValue,
          })
          .eq("id", story.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homepage settings saved successfully",
        });

        setHasUnsavedChanges(false);
        onSave();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save homepage settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        setHasUnsavedChanges(false);
        onOpenChange(false);
      }
      // If user cancels, don't call onOpenChange(false) - keep dialog open
    } else {
      onOpenChange(newOpen);
    }
  };

  // Calculate homepage readiness
  const homepageReadiness = {
    published: isPublished,
    episodesExist: episodesCount > 0,
    bannerConfigured: !isBanner || (isBanner && bannerImageUrlForm),
    newLaunchConfigured: !isNewLaunch || (isNewLaunch && tileImageUrlForm),
  };

  const readinessScore = [
    homepageReadiness.published,
    homepageReadiness.episodesExist,
    homepageReadiness.bannerConfigured,
    homepageReadiness.newLaunchConfigured,
  ].filter(Boolean).length;

  const readinessPercentage = (readinessScore / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => handleClose(newOpen)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Homepage Content Controls</DialogTitle>
          <DialogDescription>
            {isNewStory ? (
              <>
                Configure how &quot;{story.title || "this story"}&quot; will appear on the homepage. 
                Settings will be saved when you save the story.
              </>
            ) : (
              <>Configure how &quot;{story.title}&quot; appears on the homepage</>
            )}
          </DialogDescription>
          {isNewStory && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Note:</strong> This story hasn&apos;t been saved yet. Homepage settings will be applied when you save the story.
              </p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section A: Homepage Eligibility */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Homepage Eligibility</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="homepage_eligibility"
                      checked={enableHomepage}
                      onCheckedChange={(checked) => {
                        setEnableHomepage(checked === true);
                        if (!checked) {
                          setValue("is_banner", false);
                          setValue("is_new_launch", false);
                        } else {
                          // When enabling, show sections but don't auto-enable features
                          // User must explicitly enable banner/new launch
                        }
                      }}
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="homepage_eligibility" className="cursor-pointer">
                        Show this story on homepage
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, this story will be eligible for homepage display. Configure specific placements below.
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 space-y-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium mb-2">Status Indicators:</p>
                    <div className="space-y-1 text-sm">
                      <div className={`flex items-center gap-2 ${isPublished ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {isPublished ? '✅' : '⚠️'} Story is {isPublished ? 'published' : 'not published'}
                      </div>
                      <div className={`flex items-center gap-2 ${episodesCount > 0 ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {episodesCount > 0 ? '✅' : '⚠️'} {episodesCount > 0 ? `${episodesCount} episode(s) exist` : 'No episodes yet'}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Badge variant={enableHomepage ? "default" : "secondary"} className="font-semibold">
                      {enableHomepage 
                        ? (isPublished ? "Ready" : "Incomplete")
                        : "Not Configured"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section B: Banner Configuration */}
          {enableHomepage && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Banner Configuration</h3>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="is_banner"
                      checked={isBanner}
                      onCheckedChange={(checked) => setValue("is_banner", checked === true)}
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="is_banner" className="cursor-pointer">
                        Add to Homepage Banner
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, this story appears in the homepage banner carousel. Requires banner image.
                      </p>
                    </div>
                  </div>

                  {isBanner && (
                    <div className="ml-6 space-y-2">
                      <ImageUpload
                        value={bannerImageUrl}
                        onChange={setBannerImageUrl}
                        folder="banners"
                        label="Banner Image"
                        required={isBanner}
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload a wide image (16:9 ratio) for the homepage banner. Recommended: 1920x1080px, max 2MB. This image will be displayed prominently on the homepage.
                      </p>
                      {errors.banner_image_url && (
                        <p className="text-sm text-destructive">{errors.banner_image_url.message}</p>
                      )}
                      <Badge variant={bannerImageUrlForm ? "default" : "destructive"} className="font-semibold">
                        {bannerImageUrlForm ? "Ready" : "Image Required"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section C: New Launches Configuration */}
          {enableHomepage && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">New Launches Configuration</h3>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="is_new_launch"
                      checked={isNewLaunch}
                      onCheckedChange={(checked) => setValue("is_new_launch", checked === true)}
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="is_new_launch" className="cursor-pointer">
                        Show in New Launches Section
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, this story appears in the &apos;New Launches&apos; section. Requires tile image.
                      </p>
                    </div>
                  </div>

                  {isNewLaunch && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <ImageUpload
                          value={tileImageUrl}
                          onChange={setTileImageUrl}
                          folder="tiles"
                          label="Tile Image"
                          required={isNewLaunch}
                        />
                        <p className="text-sm text-muted-foreground">
                          Upload a square image (1:1 ratio) for the new launches section. Recommended: 800x800px, max 1MB. This image appears in the explore/new launches grid.
                        </p>
                        {errors.tile_image_url && (
                          <p className="text-sm text-destructive">{errors.tile_image_url.message}</p>
                        )}
                        <Badge variant={tileImageUrlForm ? "default" : "destructive"} className="font-semibold">
                          {tileImageUrlForm ? "Ready" : "Image Required"}
                        </Badge>
                      </div>

                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section D: Homepage Readiness Summary */}
          {enableHomepage && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Homepage Readiness Summary</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Status:</span>
                        <Badge variant={readinessPercentage === 100 ? "default" : readinessPercentage >= 60 ? "secondary" : "destructive"} className="font-semibold">
                          {readinessPercentage === 100 ? "Ready" : readinessPercentage >= 60 ? "Incomplete" : "Not Ready"}
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            readinessPercentage === 100
                              ? "bg-green-500"
                              : readinessPercentage >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${readinessPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{readinessScore} of 4 items complete</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 ${homepageReadiness.published ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {homepageReadiness.published ? '✅' : '❌'} Story is published
                      </div>
                      <div className={`flex items-center gap-2 ${homepageReadiness.episodesExist ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {homepageReadiness.episodesExist ? '✅' : '⚠️'} At least one episode exists
                      </div>
                      <div className={`flex items-center gap-2 ${homepageReadiness.bannerConfigured ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {homepageReadiness.bannerConfigured ? '✅' : '⚠️'} Banner configured {isBanner ? '(if enabled)' : '(optional)'}
                      </div>
                      <div className={`flex items-center gap-2 ${homepageReadiness.newLaunchConfigured ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {homepageReadiness.newLaunchConfigured ? '✅' : '⚠️'} New launches configured {isNewLaunch ? '(if enabled)' : '(optional)'}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        What happens when you save:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        {isBanner && <li>Banner will {bannerImageUrlForm ? 'show' : 'NOT show'} (image {bannerImageUrlForm ? 'uploaded' : 'missing'})</li>}
                        {isNewLaunch && <li>New launches will {tileImageUrlForm ? 'show' : 'NOT show'} (image {tileImageUrlForm ? 'uploaded' : 'missing'})</li>}
                        {!isPublished && <li className="text-amber-700 dark:text-amber-400">⚠️ Note: Story must be published for homepage visibility. Currently: Draft</li>}
                        <li className="text-muted-foreground">💡 Ranking is managed from the <Link href="/admin/ranking-visibility" className="text-primary hover:underline font-medium">Ranking & Visibility</Link> page</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Homepage Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
