"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder: "covers" | "slides" | "banners" | "tiles";
  label?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Image",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const url = await uploadImage(file, folder);
      onChange(url);
      toast({
        title: "Upload successful",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Detect compact mode (when used in tables with empty label)
  const isCompact = !label || label.trim() === "";

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className={isCompact ? "space-y-2" : "flex items-center gap-4"}>
        {preview ? (
          <div className={`relative ${isCompact ? "w-full" : ""}`}>
            <img
              src={preview}
              alt="Preview"
              className={`${isCompact ? "w-full h-24" : "h-32 w-32"} object-cover rounded-md border`}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className={`${isCompact ? "w-full h-24" : "h-32 w-32"} border-2 border-dashed rounded-md flex items-center justify-center bg-muted/30`}>
            <ImageIcon className={`${isCompact ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground`} />
          </div>
        )}
        <div className={isCompact ? "w-full" : "flex-1 space-y-2"}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            required={required && !preview}
            className="hidden"
            id={`file-input-${folder}-${Math.random().toString(36).substr(2, 9)}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`${isCompact ? "w-full text-xs h-8" : "w-full"} transition-all`}
            size={isCompact ? "sm" : "default"}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : preview ? "Change Image" : "Choose Image"}
          </Button>
          {uploading && (
            <p className="text-xs text-muted-foreground">Uploading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
