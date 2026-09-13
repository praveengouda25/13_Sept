import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createUploadId } from "@/lib/utils";

export const PHOTO_BUCKET = "student-photos";

/** Resolve a private storage path into a temporary signed URL. */
export function useSignedPhoto(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//i.test(path)) {
      setUrl(path);
      return;
    }
    void supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (error) console.error("Unable to resolve student photo:", error.message);
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

export function StudentAvatar({
  path,
  name,
  size = 36,
}: {
  path?: string | null;
  name: string;
  size?: number;
}) {
  const url = useSignedPhoto(path);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={url} alt={`Photo of ${name}`} className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

/** Upload control that stores a storage path (not a public URL) as its value. */
export function PhotoField({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useSignedPhoto(value);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5 MB");
      return;
    }
    if (!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif" || file.type === "image/webp")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${createUploadId()}.${ext}`;
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      onChange(path);
      toast.success("Student photo uploaded");
    } catch (error) {
      setLocalPreview(null);
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {localPreview || preview ? (
          <img
            src={localPreview || preview || undefined}
            alt="Student photo preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" />
        )}
      </span>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
          {value ? "Replace photo" : "Upload photo"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
