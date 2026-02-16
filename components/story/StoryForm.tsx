"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { LanguageSelect } from "@/components/story/LanguageSelect";
import { Story, StoryInsert, Language } from "@/lib/types/database";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { playSound } from "@/lib/utils/sounds";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils/cn";

// Simplified schema - homepage fields removed from validation (managed separately)
const storySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  language: z.enum(["en", "hi", "ta"]),
  release_date: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  // Homepage visibility, banner placement, and ranking are managed from the Content Control Center
});

type StoryFormData = z.infer<typeof storySchema>;

interface StoryFormProps {
  story?: Story;
}

export function StoryForm({ story }: StoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const [loading, setLoading] = useState(false);
  const [showHomepageInfo, setShowHomepageInfo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: story?.title || "",
      description: story?.description || "",
      cover_image_url: story?.cover_image_url || "",
      language: (story?.language as Language) || "en",
      release_date: story?.release_date || null,
      is_published: story?.is_published || false,
    },
  });

  const language = watch("language");
  const isPublished = watch("is_published");
  const title = watch("title");
  const description = watch("description");
  const coverImageUrl = watch("cover_image_url");

  // Ctrl+S / Cmd+S to save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const form = document.getElementById("story-form") as HTMLFormElement | null;
        if (!loading && form) form.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading]);

  const onSubmit = async (data: StoryFormData) => {
    setLoading(true);

    try {
      const supabase = createClient();

      // CRITICAL: cover_image_url must never be null or empty string (DB requires non-null TEXT)
      // Use placeholder if empty, or prevent submission
      const coverImageUrlValue = data.cover_image_url && data.cover_image_url.trim() !== "" 
        ? data.cover_image_url 
        : (story?.cover_image_url || ""); // For updates, keep existing if new is empty
      
      // For new stories, cover_image_url is required - validate before submission
      if (!story && (!coverImageUrlValue || coverImageUrlValue.trim() === "")) {
        toast({
          title: "Cover image required",
          description: "Please upload a cover image before saving the story.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Ensure boolean fields are always boolean (never undefined)
      const isPublishedValue = data.is_published ?? false;

      if (story) {
        // Update existing story
        const { error } = await supabase
          .from("stories")
          .update({
            title: data.title,
            description: data.description || null,
            cover_image_url: coverImageUrlValue || story.cover_image_url, // Keep existing if new is empty
            language: data.language,
            release_date: data.release_date || null,
            is_published: isPublishedValue,
          })
          .eq("id", story.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Story updated successfully",
        });
      } else {
        // Create new story
        const { data: newStory, error } = await supabase.from("stories").insert({
          title: data.title,
          description: data.description || null,
          cover_image_url: coverImageUrlValue, // Required - validated above
          language: data.language,
          release_date: data.release_date || null,
          is_published: isPublishedValue,
        }).select().single();

        if (error) throw error;


        toast({
          title: "Success",
          description: "Story created successfully",
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Story save error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save story";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form id="story-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
      {/* A. Story Basics */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Story Basics</h3>
          <p className="text-sm text-muted-foreground mb-6">Essential information about your story</p>
          <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
                Story Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
                placeholder="Enter the story title (e.g., 'The Magic Forest')"
        />
              <p className="text-sm text-muted-foreground">
                This title will appear in the app and on the homepage.
              </p>
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
                placeholder="Brief description of the story (optional)"
          rows={4}
        />
              <p className="text-sm text-muted-foreground">
                This description helps users discover your story. Keep it concise (2-3 sentences).
              </p>
            </div>

            <div className="space-y-2">
              <ImageUpload
                value={coverImageUrl}
                onChange={(url) => setValue("cover_image_url", url)}
                folder="covers"
                label="Cover Image"
                required={!story?.id}
              />
              <p className="text-sm text-muted-foreground">
                {story?.id 
                  ? "Upload a cover image for this story. Recommended: 800x1200px, max 2MB."
                  : "Cover image is required. Upload an image that represents this story. Recommended: 800x1200px, max 2MB."}
              </p>
              {errors.cover_image_url && (
                <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
              )}
      </div>

      <div className="space-y-2">
        <Label>Language <span className="text-destructive">*</span></Label>
        <LanguageSelect
          value={language}
          onValueChange={(value) => setValue("language", value)}
        />
              <p className="text-sm text-muted-foreground">
                Select the primary language for this story. Users can filter stories by language.
              </p>
        {errors.language && (
          <p className="text-sm text-destructive">{errors.language.message}</p>
        )}
      </div>

          </div>
        </div>
      </div>

      <hr className="border-border/60" />

      {/* B. Story Status */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">Story Status</h3>
          <p className="text-sm text-muted-foreground mb-4">Control when and how this story is visible</p>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="is_published"
            checked={isPublished}
            onCheckedChange={(checked) => {
              playSound('toggle');
              setValue("is_published", checked === true);
            }}
          />
          <div className="space-y-1 flex-1">
        <Label htmlFor="is_published" className="cursor-pointer">
              Publish this story (visible to users)
              </Label>
              <p className="text-sm text-muted-foreground">
              When published, this story will be visible in the app. You can unpublish it later.
            </p>
            {!isPublished && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                ℹ️ This story will be saved as a draft until published.
              </p>
              )}
            </div>
          </div>

        {/* Story Readiness Score */}
        <div className="ml-6 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Story Readiness</h4>
                  <span className="text-sm font-semibold">
                    {(() => {
                      const items = [
                        title,
                        description,
                        coverImageUrl,
                        language,
                      ].filter(Boolean).length;
                      return Math.round((items / 4) * 100);
                    })()}% Complete
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${(() => {
                        const items = [
                          title,
                          description,
                          coverImageUrl,
                          language,
                        ].filter(Boolean).length;
                        return (items / 4) * 100;
                      })()}%`,
                    }}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <div className={`flex items-center gap-2 ${title ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {title ? '✅' : '❌'} Title provided
                  </div>
                  <div className={`flex items-center gap-2 ${description ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {description ? '✅' : '⚠️'} Description {description ? 'provided' : 'recommended'}
                  </div>
                  <div className={`flex items-center gap-2 ${coverImageUrl ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {coverImageUrl ? '✅' : '⚠️'} Cover image {coverImageUrl ? 'uploaded' : 'recommended'}
                  </div>
                  <div className={`flex items-center gap-2 ${language ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {language ? '✅' : '❌'} Language selected
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    ℹ️ Episodes can be added after saving
                  </div>
            </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pre-Publish Checklist - Advisory */}
        {isPublished && (
          <div className="ml-6 mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100">
              ⚠️ Before publishing, consider:
            </p>
            <ul className="space-y-2 text-sm">
              <li className={`flex items-center gap-2 ${coverImageUrl ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {coverImageUrl ? '✅' : '⚠️'} Cover image {coverImageUrl ? 'uploaded' : 'recommended'}
              </li>
              <li className={`flex items-center gap-2 ${description ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {description ? '✅' : '⚠️'} Description {description ? 'provided' : 'recommended'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                ℹ️ At least one episode recommended (add after saving)
              </li>
            </ul>
          </div>
        )}
      </div>

      <hr className="border-border/60" />

      {/* C. Homepage Configuration Info - Collapsible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Homepage Settings</h3>
            <p className="text-sm text-muted-foreground">Control how this story appears on the homepage</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHomepageInfo(!showHomepageInfo)}
          >
            {showHomepageInfo ? "Hide" : "Show"}
          </Button>
        </div>
        {showHomepageInfo && (
          <Card className="border-border/60 bg-muted/30">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Homepage visibility, banner placement, and ranking are managed from the{" "}
                  <Link href="/admin/ranking-visibility" className="text-primary hover:underline font-medium">
                    Ranking & Visibility
                  </Link>
                  {" "}page in the Content Control section.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  After saving this story, you can configure its homepage placement, banner inclusion, and section ordering from the dedicated control page.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <hr className="border-border/60" />

      {/* D. Advanced - Collapsible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Advanced</h3>
            <p className="text-sm text-muted-foreground">Optional metadata and settings</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"}
          </Button>
        </div>
        {showAdvanced && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                {...register("release_date")}
              />
              <p className="text-sm text-muted-foreground">
                When was this story released? Leave empty if not applicable. This is for reference only and does not control publishing.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6 border-t">
        <Button 
          type="submit" 
          disabled={loading} 
          size="lg"
          soundType={isPublished ? "success" : "save"}
          playHoverSound
        >
          {loading 
            ? "Saving..." 
            : story 
              ? (isPublished ? "Update Published Story" : "Save Changes")
              : isPublished 
                ? "Publish Story" 
                : "Save as Draft"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          size="lg"
          soundType="click"
          playHoverSound
        >
          Cancel
        </Button>
        {!isPublished && !story && (
          <div className="flex-1 flex items-center text-sm text-muted-foreground">
            <span>💡 This will be saved as a draft. You can publish it later.</span>
          </div>
        )}
      </div>
    </form>

    {/* Sticky save bar - always visible when scrolling */}
    <div className={cn("fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur-md py-4 px-6 transition-[margin-left] duration-300", collapsed ? "ml-16" : "ml-64")}>
      <div className="container max-w-2xl mx-auto flex items-center justify-between">
        <p className="text-sm text-slate-400 truncate max-w-[50%]">
          {title || "Untitled Story"}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="story-form"
            disabled={loading}
            size="sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  </>
  );
}
